'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminLayout } from '@/components/AdminLayout';

interface Module {
  id: number;
  title: string;
  description?: string;
  order: number;
}

interface LessonContent {
  id: number;
  module_id: number;
  content_type: 'video' | 'notes' | 'slides' | 'assessment' | 'project';
  title: string;
  description?: string;
  order: number;
  video_url?: string;
  video_duration_minutes?: number;
  notes_content?: string;
  slides_url?: string;
  assessment_type?: string;
  total_questions?: number;
  passing_score?: number;
  time_limit_minutes?: number;
  project_description?: string;
  project_requirements?: string;
  project_rubric?: string;
  submission_type?: string;
}

type ContentType = 'video' | 'notes' | 'slides' | 'assessment' | 'project';

export default function ManageModule() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('id');
  const courseId = searchParams.get('courseId');

  const [module, setModule] = useState<Module | null>(null);
  const [contentItems, setContentItems] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Content form state
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('video');

  // Common fields
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentOrder, setContentOrder] = useState(1);

  // Video fields
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  // Notes fields
  const [notesContent, setNotesContent] = useState('');

  // Slides fields
  const [slidesUrl, setSlidesUrl] = useState('');

  // Assessment fields
  const [assessmentType, setAssessmentType] = useState<'quiz' | 'exam' | 'practical'>('quiz');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(0);

  // Project fields
  const [projectDescription, setProjectDescription] = useState('');
  const [projectRequirements, setProjectRequirements] = useState('');
  const [projectRubric, setProjectRubric] = useState('');
  const [submissionType, setSubmissionType] = useState<'code' | 'document' | 'link' | 'file'>('code');

  const [submitting, setSubmitting] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Fetch module and content
  useEffect(() => {
    if (!token || !moduleId || !courseId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Get module
        const moduleRes = await fetch(`http://localhost:8000/api/modules/modules/${moduleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!moduleRes.ok) throw new Error('Failed to fetch module');
        const moduleData = await moduleRes.json();
        setModule(moduleData);

        // Get content
        const contentRes = await fetch(
          `http://localhost:8000/api/admin/modules/${moduleId}/content`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!contentRes.ok) throw new Error('Failed to fetch content');
        const contentData = await contentRes.json();
        setContentItems(Array.isArray(contentData) ? contentData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, moduleId, courseId]);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentError(null);

    if (!contentTitle.trim()) {
      setContentError('Content title is required');
      return;
    }

    if (!token || !moduleId) {
      setContentError('Authentication required');
      return;
    }

    setSubmitting(true);

    try {
      const body: any = {
        content_type: contentType,
        title: contentTitle,
        description: contentDescription,
        order: contentOrder,
      };

      // Add type-specific fields
      switch (contentType) {
        case 'video':
          if (!videoUrl.trim()) throw new Error('Video URL is required');
          body.video_url = videoUrl;
          body.video_duration_minutes = videoDuration;
          break;
        case 'notes':
          if (!notesContent.trim()) throw new Error('Notes content is required');
          body.notes_content = notesContent;
          break;
        case 'slides':
          if (!slidesUrl.trim()) throw new Error('Slides URL is required');
          body.slides_url = slidesUrl;
          break;
        case 'assessment':
          if (totalQuestions <= 0) throw new Error('Total questions must be greater than 0');
          body.assessment_type = assessmentType;
          body.total_questions = totalQuestions;
          body.passing_score = passingScore;
          body.time_limit_minutes = timeLimit;
          break;
        case 'project':
          if (!projectDescription.trim()) throw new Error('Project description is required');
          body.project_description = projectDescription;
          body.project_requirements = projectRequirements;
          body.project_rubric = projectRubric;
          body.submission_type = submissionType;
          break;
      }

      const response = await fetch(`http://localhost:8000/api/admin/modules/${moduleId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      const newContent = await response.json();
      setContentItems([...contentItems, newContent]);

      // Reset form
      setContentTitle('');
      setContentDescription('');
      setContentOrder(contentItems.length + 1);
      setVideoUrl('');
      setVideoDuration(0);
      setNotesContent('');
      setSlidesUrl('');
      setAssessmentType('quiz');
      setTotalQuestions(0);
      setPassingScore(70);
      setTimeLimit(0);
      setProjectDescription('');
      setProjectRequirements('');
      setProjectRubric('');
      setSubmissionType('code');
      setShowContentForm(false);
    } catch (err) {
      setContentError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete content');

      setContentItems(contentItems.filter(c => c.id !== contentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content');
    }
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'video':
        return '▶️';
      case 'notes':
        return '📝';
      case 'slides':
        return '📊';
      case 'assessment':
        return '✓';
      case 'project':
        return '🚀';
      default:
        return '📄';
    }
  };

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
  };

  // Validate YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    return extractYouTubeId(url) !== null;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="text-gray-300 mt-4">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!module) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-300">Module not found</p>
          <button
            onClick={() => router.push(`/super-admin/manage-course?id=${courseId}`)}
            className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Course
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Module Header */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Module {module.order}: {module.title}
              </h1>
              {module.description && (
                <p className="text-gray-400">{module.description}</p>
              )}
            </div>
            <button
              onClick={() => router.push(`/super-admin/manage-course?id=${courseId}`)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Content Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Module Content</h2>
            <button
              onClick={() => setShowContentForm(!showContentForm)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium text-lg"
            >
              {showContentForm ? '✕ Cancel' : '+ Add Content Item'}
            </button>
          </div>

          {/* Content Types Guide */}
          {!showContentForm && contentItems.length === 0 && (
            <div className="bg-cyan-950/30 border border-cyan-700 rounded-lg p-6 mb-6">
              <p className="text-cyan-300 font-medium mb-4">📚 Choose a content type to get started:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                <div className="bg-gray-800/50 p-3 rounded border border-cyan-600/30">
                  <p className="text-cyan-300 font-medium">▶️ Video</p>
                  <p className="text-gray-400 text-xs mt-1">YouTube videos with preview</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-cyan-600/30">
                  <p className="text-cyan-300 font-medium">📝 Notes</p>
                  <p className="text-gray-400 text-xs mt-1">Text content & documentation</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-cyan-600/30">
                  <p className="text-cyan-300 font-medium">📊 Slides</p>
                  <p className="text-gray-400 text-xs mt-1">Presentations & resources</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-cyan-600/30">
                  <p className="text-cyan-300 font-medium">✓ Assessment</p>
                  <p className="text-gray-400 text-xs mt-1">Quiz, exam, or practical test</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-cyan-600/30">
                  <p className="text-cyan-300 font-medium">🚀 Project</p>
                  <p className="text-gray-400 text-xs mt-1">Hands-on coding or task</p>
                </div>
              </div>
            </div>
          )}

          {/* Add Content Form */}
          {showContentForm && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              {contentError && (
                <div className="p-3 mb-4 bg-red-900/20 border border-red-500 text-red-300 rounded">
                  {contentError}
                </div>
              )}

              <form onSubmit={handleAddContent} className="space-y-4">
                {/* Content Type Selector */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Content Type *</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['video', 'notes', 'slides', 'assessment', 'project'] as ContentType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setContentType(type)}
                        className={`p-3 rounded-lg border-2 font-medium transition-all ${
                          contentType === type
                            ? 'border-cyan-500 bg-cyan-600/20 text-cyan-300'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-cyan-400'
                        }`}
                      >
                        {getContentTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Common Fields */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder="e.g., Introduction to Variables"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    placeholder="Brief description of this content"
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={contentOrder}
                    onChange={(e) => setContentOrder(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Content Type Specific Fields */}
                {contentType === 'video' && (
                  <>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">YouTube URL *</label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                        className={`w-full px-4 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-cyan-500 text-white ${
                          videoUrl && !isValidYouTubeUrl(videoUrl) ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">Paste YouTube video URL. Supports youtube.com/watch?v=... or youtu.be/... formats</p>
                      {videoUrl && !isValidYouTubeUrl(videoUrl) && (
                        <p className="text-xs text-red-400 mt-1">❌ Invalid YouTube URL. Please check the format.</p>
                      )}
                      {videoUrl && isValidYouTubeUrl(videoUrl) && (
                        <p className="text-xs text-green-400 mt-1">✓ Valid YouTube URL</p>
                      )}
                    </div>

                    {/* YouTube Preview */}
                    {videoUrl && isValidYouTubeUrl(videoUrl) && (
                      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                        <p className="text-gray-300 text-sm font-medium mb-3">Preview:</p>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            width="100%"
                            height="100%"
                            src={getYouTubeEmbedUrl(videoUrl) || ''}
                            title="YouTube video preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(Number(e.target.value))}
                        min="0"
                        placeholder="e.g., 15 (approximate duration)"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional: Helps students know video length</p>
                    </div>
                  </>
                )}

                {contentType === 'notes' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Notes Content *</label>
                    <textarea
                      value={notesContent}
                      onChange={(e) => setNotesContent(e.target.value)}
                      placeholder="Enter notes content (supports HTML/Markdown)"
                      rows={6}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono"
                    />
                  </div>
                )}

                {contentType === 'slides' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Slides URL *</label>
                    <input
                      type="url"
                      value={slidesUrl}
                      onChange={(e) => setSlidesUrl(e.target.value)}
                      placeholder="https://docs.google.com/presentation/... or PDF URL"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                )}

                {contentType === 'assessment' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Assessment Type</label>
                        <select
                          value={assessmentType}
                          onChange={(e) => setAssessmentType(e.target.value as any)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="quiz">Quiz</option>
                          <option value="exam">Exam</option>
                          <option value="practical">Practical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Total Questions *</label>
                        <input
                          type="number"
                          value={totalQuestions}
                          onChange={(e) => setTotalQuestions(Number(e.target.value))}
                          min="1"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Passing Score (%)</label>
                        <input
                          type="number"
                          value={passingScore}
                          onChange={(e) => setPassingScore(Number(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Time Limit (minutes)</label>
                        <input
                          type="number"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(Number(e.target.value))}
                          min="0"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {contentType === 'project' && (
                  <>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Project Description *</label>
                      <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="What is the project about?"
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Requirements</label>
                      <textarea
                        value={projectRequirements}
                        onChange={(e) => setProjectRequirements(e.target.value)}
                        placeholder="List project requirements (e.g., Use React, Node.js, MongoDB)"
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Rubric/Scoring Criteria</label>
                      <textarea
                        value={projectRubric}
                        onChange={(e) => setProjectRubric(e.target.value)}
                        placeholder="How will this be graded?"
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Submission Type</label>
                      <select
                        value={submissionType}
                        onChange={(e) => setSubmissionType(e.target.value as any)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="code">Code (GitHub/Repo)</option>
                        <option value="document">Document</option>
                        <option value="link">Link</option>
                        <option value="file">File Upload</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium"
                  >
                    {submitting ? '⏳ Adding...' : '✓ Add Content'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContentForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Content List */}
          {contentItems.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 border-dashed text-center">
              <p className="text-gray-400">No content yet. Add your first content item to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {contentItems.map((content) => (
                <div
                  key={content.id}
                  className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-cyan-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getContentTypeIcon(content.content_type)}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {content.order}. {content.title}
                        </h3>
                        <p className="text-gray-400 text-sm italic">{content.content_type}</p>
                        {content.description && (
                          <p className="text-gray-400 text-sm mt-1">{content.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteContent(content.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Display Content Details */}
                  <div className="bg-gray-900 rounded p-3 text-xs text-gray-400 space-y-1">
                    {content.content_type === 'video' && (
                      <>
                        <div className="mb-3">
                          {isValidYouTubeUrl(content.video_url || '') ? (
                            <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-xs">
                              <iframe
                                width="100%"
                                height="100%"
                                src={getYouTubeEmbedUrl(content.video_url || '') || ''}
                                title="Video preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : (
                            <p><span className="text-cyan-300">URL:</span> {content.video_url}</p>
                          )}
                        </div>
                        {(content.video_duration_minutes ?? 0) > 0 && (
                          <p><span className="text-cyan-300">Duration:</span> {content.video_duration_minutes} min</p>
                        )}
                      </>
                    )}
                    {content.content_type === 'notes' && (
                      <p><span className="text-cyan-300">Content:</span> {content.notes_content?.substring(0, 100)}...</p>
                    )}
                    {content.content_type === 'slides' && (
                      <p><span className="text-cyan-300">URL:</span> {content.slides_url}</p>
                    )}
                    {content.content_type === 'assessment' && (
                      <>
                        <p>
                          <span className="text-cyan-300">Type:</span> {content.assessment_type} | 
                          <span className="text-cyan-300 ml-2">Questions:</span> {content.total_questions}
                        </p>
                        <p>
                          <span className="text-cyan-300">Pass Score:</span> {content.passing_score}% | 
                          <span className="text-cyan-300 ml-2">Time:</span> {content.time_limit_minutes || '∞'} min
                        </p>
                      </>
                    )}
                    {content.content_type === 'project' && (
                      <>
                        <p><span className="text-cyan-300">Submission:</span> {content.submission_type}</p>
                        <p><span className="text-cyan-300">Description:</span> {content.project_description?.substring(0, 80)}...</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
