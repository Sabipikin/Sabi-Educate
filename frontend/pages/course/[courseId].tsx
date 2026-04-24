'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Course, Lesson, Module, ContentItem, Question, apiService, CanEnrollResponse, MyEnrollmentResponse, CourseProgressDetailResponse } from '@/services/api';

export default function CoursePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [lessonProgress, setLessonProgress] = useState<Map<number, number>>(new Map());
  const [simulatingView, setSimulatingView] = useState(false);
  const [enrollment, setEnrollment] = useState<MyEnrollmentResponse | null>(null);
  const [canEnroll, setCanEnroll] = useState<CanEnrollResponse | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [starting, setStarting] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleContent, setModuleContent] = useState<ContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [activeAssessmentContent, setActiveAssessmentContent] = useState<ContentItem | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<Question[]>([]);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, string>>({});
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{ score: number; total_points: number; percentage: number; is_passing: boolean } | null>(null);
  const [contentProgressLoading, setContentProgressLoading] = useState<Record<number, boolean>>({});
  const [courseProgress, setCourseProgress] = useState<CourseProgressDetailResponse | null>(null);
  const [courseProgressLoading, setCourseProgressLoading] = useState(false);

  // Extract course ID from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const id = path.split('/').pop();
      if (id) {
        setCourseId(parseInt(id));
      }
    }
  }, []);

  useEffect(() => {
    if (!courseId) return;
  }, [courseId]);

  // Fetch course and lessons
  useEffect(() => {
    const fetchCourseContent = async () => {
      if (!courseId) return;
      
      try {
        setLoadingContent(true);
        const courseData = await apiService.getCourse(courseId as number, token || undefined);
        setCourse(courseData);

        const lessonsData = await apiService.getCourseLessons(courseId as number, token || undefined);
        setLessons(lessonsData);

        if (token) {
          const enrollmentResponse = await apiService.getMyEnrollment(courseId as number, token).catch(() => null);
          setEnrollment(enrollmentResponse);

          const canEnrollResponse = await apiService.canEnrollCourse(courseId as number, token).catch(() => null);
          setCanEnroll(canEnrollResponse);

          if (enrollmentResponse?.status === 'active') {
            const modulesData = await apiService.getCourseModules(courseId as number, token);
            setModules(modulesData);
            if (modulesData.length > 0) {
              setSelectedModule(modulesData[0]);
              const contentData = await apiService.getModuleContent(courseId as number, modulesData[0].id, token);
              setModuleContent(contentData);
            }
            setCourseProgressLoading(true);
            apiService.getCourseProgress(courseId as number, token).then(setCourseProgress).catch(err => {
              console.error('Failed to load course progress:', err);
              setCourseProgress(null);
            }).finally(() => setCourseProgressLoading(false));
          }
        }

        if (lessonsData.length > 0) {
          setSelectedLesson(lessonsData[0]);
          const progressMap = new Map();
          lessonsData.forEach(lesson => {
            progressMap.set(lesson.id, 0);
          });
          setLessonProgress(progressMap);
        }
      } catch (error) {
        console.error('Failed to fetch course content:', error);
        alert('Failed to load course content');
      } finally {
        setLoadingContent(false);
        setEnrollmentLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId, token]);

  // Simulate viewing content - gradually increase progress
  useEffect(() => {
    if (!selectedLesson || simulatingView) return;
    
    setSimulatingView(true);
    const interval = setInterval(() => {
      setLessonProgress(prev => {
        const newProgress = new Map(prev);
        const current = newProgress.get(selectedLesson.id) || 0;
        if (current < 100) {
          newProgress.set(selectedLesson.id, Math.min(current + Math.random() * 15, 100));
          return newProgress;
        } else {
          clearInterval(interval);
          setSimulatingView(false);
          return prev;
        }
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      setSimulatingView(false);
    };
  }, [selectedLesson, simulatingView]);

  const handleCompleteLesson = async () => {
    if (!selectedLesson || !token || !enrollment || enrollment.status === 'enrolled') {
      alert('Please start the course before completing lessons.');
      return;
    }
    
    setCompletingLesson(true);
    try {
      await apiService.completeLesson(selectedLesson.id, token);
      await apiService.updateLessonProgress(selectedLesson.id, 100, token);
      setCompletedLessons(prev => new Set(prev).add(selectedLesson.id));
      
      const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
      if (currentIndex < lessons.length - 1) {
        setSelectedLesson(lessons[currentIndex + 1]);
        alert('Lesson completed! Moving to next lesson.');
      } else {
        alert('🎉 Congratulations! You have completed all lessons in this course!');
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      alert('Failed to mark lesson as complete');
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleEnrollCourse = async () => {
    if (!courseId) return;
    if (!token) {
      router.push(`/signup?next=/course/${courseId}`);
      return;
    }

    setEnrolling(true);
    try {
      await apiService.enrollCourse(courseId, token);
      const updatedEnrollment = await apiService.getMyEnrollment(courseId, token);
      setEnrollment(updatedEnrollment);
      setCanEnroll(null);
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      alert('Failed to enroll in the course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = async () => {
    if (!courseId) {
      return;
    }
    if (!token) {
      router.push(`/signup?next=/course/${courseId}`);
      return;
    }

    setStarting(true);
    try {
      await apiService.startLearning(courseId, token);
      const updatedEnrollment = await apiService.getMyEnrollment(courseId, token);
      setEnrollment(updatedEnrollment);
      const modulesData = await apiService.getCourseModules(courseId, token);
      setModules(modulesData);
      if (modulesData.length > 0) {
        setSelectedModule(modulesData[0]);
        const contentData = await apiService.getModuleContent(courseId, modulesData[0].id, token);
        setModuleContent(contentData);
      }
      alert('Your learning path is active. Continue through the lessons now.');
    } catch (error) {
      console.error('Failed to start learning:', error);
      alert('Failed to start learning. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleSelectModule = async (module: Module) => {
    if (!courseId || !token) return;
    setSelectedModule(module);
    setContentLoading(true);
    setActiveAssessmentContent(null);
    setAssessmentQuestions([]);
    setAssessmentAnswers({});
    setAssessmentResult(null);
    try {
      const contentData = await apiService.getModuleContent(courseId, module.id, token);
      setModuleContent(contentData);
    } catch (error) {
      console.error('Failed to load module content:', error);
      alert('Unable to load module content.');
    } finally {
      setContentLoading(false);
    }
  };

  const parseOptions = (options?: string[] | string): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    try {
      return JSON.parse(options);
    } catch {
      return [options];
    }
  };

  const handleCompleteContent = async (item: ContentItem) => {
    if (!token || !courseId) return;
    setContentProgressLoading(prev => ({ ...prev, [item.id]: true }));
    try {
      const progress = await apiService.updateContentProgress(item.id, 100, true, 0, token);
      setModuleContent(prev => prev.map(i => i.id === item.id ? { ...i, progress } : i));
      const updatedEnrollment = await apiService.getMyEnrollment(courseId, token);
      setEnrollment(updatedEnrollment);
      const updatedCourseProgress = await apiService.getCourseProgress(courseId, token);
      setCourseProgress(updatedCourseProgress);
      alert(`${item.title} marked complete.`);
    } catch (error) {
      console.error('Failed to update content progress:', error);
      alert('Unable to update content progress.');
    } finally {
      setContentProgressLoading(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleOpenAssessment = async (item: ContentItem) => {
    if (!token) return;
    setActiveAssessmentContent(item);
    setAssessmentLoading(true);
    setAssessmentQuestions([]);
    setAssessmentAnswers({});
    setAssessmentResult(null);
    try {
      const questions = await apiService.getAssessmentQuestions(item.id, token);
      setAssessmentQuestions(questions);
    } catch (error) {
      console.error('Failed to load assessment questions:', error);
      alert('Could not load assessment questions.');
    } finally {
      setAssessmentLoading(false);
    }
  };

  const handleAssessmentChange = (questionId: number, value: string) => {
    setAssessmentAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitAssessment = async () => {
    if (!token || !activeAssessmentContent || !courseId) return;
    setAssessmentSubmitting(true);
    try {
      const result = await apiService.submitAssessmentAnswers(activeAssessmentContent.id, assessmentAnswers, token);
      setAssessmentResult(result);
      setModuleContent(prev => prev.map(item => item.id === activeAssessmentContent.id ? {
        ...item,
        progress: {
          ...item.progress,
          view_progress_percentage: 100,
          is_completed: true,
        },
      } : item));
      const updatedEnrollment = await apiService.getMyEnrollment(courseId, token);
      setEnrollment(updatedEnrollment);
      const updatedCourseProgress = await apiService.getCourseProgress(courseId, token);
      setCourseProgress(updatedCourseProgress);
      alert(`Assessment submitted. Score: ${result.score}/${result.total_points}`);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Failed to submit assessment answers.');
    } finally {
      setAssessmentSubmitting(false);
    }
  };

  const handleCloseAssessment = () => {
    setActiveAssessmentContent(null);
    setAssessmentQuestions([]);
    setAssessmentAnswers({});
    setAssessmentResult(null);
  };

  if (loading || loadingContent || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = enrollment?.progress_percentage ?? (lessons.length ? Math.round((completedLessons.size / lessons.length) * 100) : 0);
  const isLessonCompleted = selectedLesson ? completedLessons.has(selectedLesson.id) : false;
  const currentLessonProgress = selectedLesson ? (lessonProgress.get(selectedLesson.id) || 0) : 0;
  const canProceedToNext = currentLessonProgress >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Course Header */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-primary/20 glow">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-6">
            <div className="flex-1 mb-6 lg:mb-0">
              <Link href="/dashboard" className="text-primary hover:text-primary-dark font-medium mb-6 inline-flex items-center transition-colors">
                <span className="mr-2">←</span> Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">{course?.title}</h1>
              <p className="text-text-muted mb-6 leading-relaxed">{course?.description}</p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="bg-surface-light/50 rounded-xl px-4 py-2">
                  <span className="text-text-muted text-sm">Category:</span>
                  <span className="text-foreground font-medium ml-2">{course?.category}</span>
                </div>
                <div className="bg-surface-light/50 rounded-xl px-4 py-2">
                  <span className="text-text-muted text-sm">Difficulty:</span>
                  <span className="text-foreground font-medium ml-2">{course?.difficulty}</span>
                </div>
                <div className="bg-surface-light/50 rounded-xl px-4 py-2">
                  <span className="text-text-muted text-sm">Duration:</span>
                  <span className="text-foreground font-medium ml-2">{course?.duration_hours} hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-foreground">Course Progress</span>
              <span className="text-sm font-medium text-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-surface-light rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <p className="text-sm text-text-muted">
            {completedLessons.size} of {lessons.length} lessons completed
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lessons / Modules Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-primary/20 glow">
              <div className="p-6 border-b border-primary/20">
                <h2 className="text-2xl font-bold text-foreground font-display">
                  {modules.length > 0 ? 'Modules' : 'Lessons'}
                </h2>
              </div>
              <div className="divide-y divide-primary/20">
                {modules.length > 0 ? (
                  modules.map((module, index) => {
                    const moduleProgress = courseProgress?.modules.find(m => m.module_id === module.id);
                    const isModuleComplete = moduleProgress && moduleProgress.completed_items === moduleProgress.total_items && moduleProgress.total_items > 0;
                    return (
                      <button
                        key={module.id}
                        onClick={() => handleSelectModule(module)}
                        className={`w-full text-left p-4 transition-all hover:scale-105 ${
                          selectedModule?.id === module.id
                            ? 'bg-primary/10 border-l-4 border-primary'
                            : 'hover:bg-surface-light/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            {isModuleComplete ? (
                              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center glow">
                                <svg className="w-5 h-5 text-background" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-surface-light rounded-full flex items-center justify-center text-sm font-bold text-foreground border-2 border-primary/30">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{module.title}</p>
                            {moduleProgress ? (
                              <div className="flex flex-col gap-1 mt-2">
                                <p className="text-xs text-text-muted">{moduleProgress.completed_items}/{moduleProgress.total_items} items</p>
                                <div className="w-full bg-surface-light rounded-full h-1 overflow-hidden">
                                  <div
                                    className="h-1 rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${moduleProgress.progress_percentage}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-text-muted">{module.description || 'Loading progress...'}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left p-4 transition-all hover:scale-105 ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'hover:bg-surface-light/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {completedLessons.has(lesson.id) ? (
                            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center glow">
                              <svg className="w-5 h-5 text-background" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-surface-light rounded-full flex items-center justify-center text-sm font-bold text-foreground border-2 border-primary/30">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{lesson.title}</p>
                          <p className="text-xs text-text-muted">{lesson.duration_minutes} mins</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Lesson / Module Content */}
          <div className="lg:col-span-3">
            {modules.length > 0 && selectedModule ? (
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-primary/20 glow">
                <div className="p-8 border-b border-primary/20">
                  <h2 className="text-3xl font-bold text-foreground mb-4 font-display">{selectedModule.title}</h2>
                  <p className="text-text-muted mb-8 leading-relaxed">{selectedModule.description || 'Complete this module by reviewing its content items.'}</p>
                </div>
                <div className="p-8">
                  <div className="mb-6 flex flex-wrap gap-4">
                    <span className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-medium">Module {selectedModule.order}</span>
                    <span className="rounded-full bg-surface-light text-foreground px-4 py-2 text-sm">{moduleContent.length} content item{moduleContent.length === 1 ? '' : 's'}</span>
                  </div>

                  {contentLoading ? (
                    <div className="text-center py-12 text-foreground">Loading module content...</div>
                  ) : moduleContent.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">No content found for this module.</div>
                  ) : (
                    <div className="space-y-4">
                      {moduleContent.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-primary/10 bg-surface-light p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                              <p className="text-sm text-text-muted mt-2">{item.description || item.content_type}</p>
                            </div>
                            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                              {item.content_type}
                            </span>
                          </div>

                          {item.content_type === 'video' && item.video_url ? (
                            <div className="mt-6 aspect-video rounded-3xl overflow-hidden border border-primary/10">
                              <iframe
                                width="100%"
                                height="100%"
                                src={item.video_url}
                                title={item.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded-3xl"
                              />
                            </div>
                          ) : null}

                          {item.content_type === 'notes' && item.notes_content ? (
                            <div className="mt-6 rounded-3xl border border-primary/10 bg-surface p-5 text-sm leading-7 text-foreground">
                              {item.notes_content}
                            </div>
                          ) : null}

                          {item.content_type === 'slides' && item.slides_url ? (
                            <div className="mt-6">
                              <a
                                href={item.slides_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-primary font-semibold"
                              >
                                View slides
                              </a>
                            </div>
                          ) : null}

                          {item.content_type === 'assessment' ? (
                            <div className="mt-6 rounded-3xl border border-primary/10 bg-surface p-5 text-sm text-foreground">
                              <p className="font-semibold">Assessment</p>
                              <p className="text-text-muted mt-2">{item.total_questions ?? 0} questions • Passing score {item.passing_score ?? 0}%</p>
                            </div>
                          ) : null}

                          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-xs text-text-muted mb-2">
                                Progress: {item.progress.view_progress_percentage}% {item.progress.is_completed ? '• Completed' : ''}
                              </p>
                              <div className="w-full bg-surface-light rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-2 rounded-full bg-primary transition-all duration-300"
                                  style={{ width: `${item.progress.view_progress_percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.content_type === 'assessment' ? (
                                <button
                                  onClick={() => handleOpenAssessment(item)}
                                  disabled={assessmentLoading || contentProgressLoading[item.id]}
                                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-primary-dark disabled:opacity-50"
                                >
                                  {item.progress.is_completed ? 'Review Assessment' : 'Start Assessment'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCompleteContent(item)}
                                  disabled={item.progress.is_completed || contentProgressLoading[item.id]}
                                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${item.progress.is_completed ? 'bg-surface-light text-text-muted cursor-not-allowed' : 'bg-primary text-background hover:bg-primary-dark'} disabled:opacity-50`}
                                >
                                  {item.progress.is_completed ? 'Completed' : 'Mark Complete'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {activeAssessmentContent ? (
                        <div className="mt-8 rounded-3xl border border-primary/10 bg-surface p-8">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            <div>
                              <h3 className="text-2xl font-semibold text-foreground">{activeAssessmentContent.title}</h3>
                              <p className="text-sm text-text-muted mt-2">Complete these questions to finish the assessment.</p>
                            </div>
                            <button
                              onClick={handleCloseAssessment}
                              className="rounded-full border border-primary/20 bg-surface px-4 py-2 text-sm text-primary hover:bg-primary/5"
                            >
                              Close assessment
                            </button>
                          </div>

                          {assessmentLoading ? (
                            <div className="text-center py-12 text-foreground">Loading assessment questions...</div>
                          ) : assessmentQuestions.length === 0 ? (
                            <div className="text-center py-12 text-text-muted">No assessment questions are available for this content yet.</div>
                          ) : (
                            <div className="space-y-6">
                              {assessmentQuestions.map(question => (
                                <div key={question.id} className="rounded-3xl border border-primary/10 bg-surface-light p-5">
                                  <p className="font-semibold text-foreground">{question.order}. {question.question_text}</p>
                                  {question.question_type === 'objective' ? (
                                    <div className="mt-4 space-y-3">
                                      {parseOptions(question.options).map(option => (
                                        <label key={option} className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-background p-3">
                                          <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={option}
                                            checked={assessmentAnswers[question.id] === option}
                                            onChange={(e) => handleAssessmentChange(question.id, e.target.value)}
                                            className="accent-primary"
                                          />
                                          <span className="text-sm text-foreground">{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    <textarea
                                      value={assessmentAnswers[question.id] || ''}
                                      onChange={(e) => handleAssessmentChange(question.id, e.target.value)}
                                      className="w-full rounded-3xl border border-primary/10 bg-background p-4 text-sm text-foreground focus:border-primary focus:outline-none"
                                      rows={4}
                                      placeholder="Write your answer here..."
                                    />
                                  )}
                                </div>
                              ))}
                              <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                                <button
                                  onClick={handleSubmitAssessment}
                                  disabled={assessmentSubmitting}
                                  className="rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-background hover:bg-primary-dark transition disabled:opacity-50"
                                >
                                  {assessmentSubmitting ? 'Submitting...' : 'Submit Assessment'}
                                </button>
                                {assessmentResult ? (
                                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500 p-4 text-foreground">
                                    <p className="font-semibold">Result: {assessmentResult.percentage}%</p>
                                    <p className="text-sm">{assessmentResult.score}/{assessmentResult.total_points} points — {assessmentResult.is_passing ? 'Passed' : 'Needs improvement'}</p>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ) : selectedLesson ? (
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-primary/20 glow">
                <div className="p-8 border-b border-primary/20">
                  <h2 className="text-3xl font-bold text-foreground mb-4 font-display">{selectedLesson.title}</h2>
                  <p className="text-text-muted mb-8 leading-relaxed">{selectedLesson.content || 'No description available'}</p>

                  {/* Lesson Content Placeholder - Simulates Reading/Video Watching */}
                  {!isLessonCompleted && (
                    <div className="mb-8 p-6 bg-primary/5 rounded-2xl border-2 border-primary/20">
                      <h3 className="text-xl font-semibold text-foreground mb-6 font-display">📖 Lesson Content</h3>
                      <div className="aspect-video bg-surface rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-primary/10">
                        {selectedLesson.video_url ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={selectedLesson.video_url}
                            title={selectedLesson.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-2xl"
                          ></iframe>
                        ) : (
                          <div className="text-center text-foreground">
                            <div className="text-6xl mb-4">📺</div>
                            <p className="text-lg font-medium">Video or Reading Content</p>
                            <p className="text-sm text-text-muted mt-2">Progressing as you view...</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="text-sm">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-foreground">Viewing Progress</span>
                            <span className="font-semibold text-foreground">{Math.round(currentLessonProgress)}%</span>
                          </div>
                          <div className="w-full bg-surface-light rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-4 rounded-full transition-all duration-300 ${
                                currentLessonProgress >= 80 ? 'bg-accent' : 'bg-primary'
                              }`}
                              style={{ width: `${currentLessonProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        {currentLessonProgress >= 80 ? (
                          <p className="text-sm text-accent font-semibold flex items-center">
                            <span className="mr-2">✓</span> You've viewed enough to proceed to the next lesson
                          </p>
                        ) : (
                          <p className="text-secondary text-sm font-medium">
                            View at least 80% of the content ({Math.ceil(80 - currentLessonProgress)}% remaining)
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLesson.video_url && isLessonCompleted && (
                    <div className="mb-8">
                      <div className="aspect-video bg-surface rounded-2xl overflow-hidden border border-primary/10">
                        <iframe
                          width="100%"
                          height="100%"
                          src={selectedLesson.video_url}
                          title={selectedLesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-2xl"
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mb-6">
                    {enrollmentLoading ? (
                      <div className="rounded-2xl bg-surface-light/80 p-4 text-center text-sm text-foreground">Checking your enrollment...</div>
                    ) : enrollment ? (
                      <div className="rounded-2xl bg-surface-light/80 p-4">
                        <p className="text-sm text-foreground mb-3">Current enrollment status: <span className="font-semibold">{enrollment.status}</span></p>
                        {enrollment.status === 'enrolled' && (
                          <button
                            onClick={handleStartLearning}
                            disabled={starting}
                            className="w-full bg-yellow-500 text-background py-4 rounded-xl font-semibold hover:bg-yellow-600 transition-all hover:scale-105 glow disabled:opacity-50"
                          >
                            {starting ? 'Starting course...' : 'Start Learning'}
                          </button>
                        )}
                        {enrollment.status === 'active' && (
                          <div className="rounded-2xl border border-green-500 bg-green-500/10 p-4 text-green-200">
                            You have access to this course. Continue through the lessons below.
                          </div>
                        )}
                        {enrollment.status === 'completed' && (
                          <div className="rounded-2xl border border-cyan-500 bg-cyan-500/10 p-4 text-cyan-100">
                            You have completed this course. Great job! Review lessons or explore another course.</div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-surface-light/80 p-4">
                        <p className="text-sm text-foreground mb-3">You are not enrolled in this course yet.</p>
                        {canEnroll && canEnroll.requires_payment ? (
                          <div className="mb-4 rounded-2xl border border-amber-500 bg-amber-500/10 p-4 text-amber-100">
                            <p className="text-sm font-medium">Paid course</p>
                            <p className="text-xs text-text-muted">Price: £{(canEnroll.final_price ?? canEnroll.price ?? 0) / 100}</p>
                            {canEnroll.promo_amount ? (
                              <p className="text-xs text-emerald-200">Promo discount: £{canEnroll.promo_amount / 100}</p>
                            ) : null}
                          </div>
                        ) : null}
                        <button
                          onClick={handleEnrollCourse}
                          disabled={enrolling}
                          className="w-full bg-primary text-background py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all hover:scale-105 glow disabled:opacity-50"
                        >
                          {enrolling ? 'Enrolling...' : canEnroll?.requires_payment ? 'Enroll and Pay' : 'Enroll for Free'}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    {!isLessonCompleted && canProceedToNext && enrollment && enrollment.status === 'active' && (
                      <button
                        onClick={handleCompleteLesson}
                        disabled={completingLesson}
                        className="flex-1 bg-primary text-background py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all hover:scale-105 glow disabled:opacity-50"
                      >
                        {completingLesson ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                            Completing...
                          </div>
                        ) : (
                          'Mark as Complete'
                        )}
                      </button>
                    )}

                    {!canProceedToNext && !isLessonCompleted && (
                      <button
                        disabled
                        className="flex-1 bg-surface-light text-text-muted py-4 rounded-xl font-semibold cursor-not-allowed"
                      >
                        Continue Viewing Content
                      </button>
                    )}

                    {isLessonCompleted && selectedLesson.id !== lessons[lessons.length - 1]?.id && (
                      <button
                        onClick={() => {
                          const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
                          if (currentIndex < lessons.length - 1) {
                            setSelectedLesson(lessons[currentIndex + 1]);
                          }
                        }}
                        className="flex-1 bg-accent text-background py-4 rounded-xl font-semibold hover:bg-accent/80 transition-all hover:scale-105 glow"
                      >
                        Next Lesson
                      </button>
                    )}

                    {isLessonCompleted && selectedLesson.id === lessons[lessons.length - 1]?.id && (
                      <Link href="/dashboard" className="flex-1">
                        <div className="w-full bg-secondary text-background py-4 rounded-xl font-semibold hover:bg-secondary/80 transition-all hover:scale-105 glow text-center">
                          Back to Dashboard
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-primary/20 glow">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-text-muted text-lg">No lessons available for this course yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
