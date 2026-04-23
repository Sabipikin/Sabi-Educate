'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { apiService, Project, CV, Experience, Education, Skill, Certificate } from '@/services/api';
import { generateResumePDF } from '@/services/resumePdf';

type Tab = 'resume' | 'projects';
type ResumeTab = 'overview' | 'experience' | 'education' | 'skills' | 'certificates' | 'projects';

export default function PortfolioPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [resumeTab, setResumeTab] = useState<ResumeTab>('overview');
  
  // Resume/CV state
  const [cv, setCV] = useState<CV | null>(null);
  const [cvLoading, setCVLoading] = useState(true);
  const [cvEditing, setCVEditing] = useState(false);
  const [cvForm, setCVForm] = useState({
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    linkedin_url: '',
    website_url: ''
  });

  // Experience state
  const [experienceForm, setExperienceForm] = useState({
    company: '',
    position: '',
    description: '',
    start_date: '',
    end_date: ''
  });
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);

  // Education state
  const [educationForm, setEducationForm] = useState({
    institution: '',
    degree: '',
    field: '',
    graduation_date: ''
  });
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null);

  // Skills state
  const [skillForm, setSkillForm] = useState({
    name: '',
    level: ''
  });
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);

  // Certificates state
  const [certificateForm, setCertificateForm] = useState({
    name: '',
    issuer: '',
    issue_date: '',
    expiration_date: '',
    credential_url: '',
    credential_id: ''
  });
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [editingCertificateId, setEditingCertificateId] = useState<number | null>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    github_url: '',
    project_url: '',
    technologies: ''
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  useEffect(() => {
    if (token) {
      fetchCV();
      fetchProjects();
    }
  }, [token]);

  const fetchCV = async () => {
    try {
      const cvData = await apiService.getCV(token || undefined);
      setCV(cvData);
      setCVForm({
        title: cvData.title || '',
        email: cvData.email || '',
        phone: cvData.phone || '',
        location: cvData.location || '',
        summary: cvData.summary || '',
        linkedin_url: cvData.linkedin_url || '',
        website_url: cvData.website_url || ''
      });
    } catch (error) {
      console.error('Failed to fetch CV:', error);
    } finally {
      setCVLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await apiService.getProjects(token || undefined);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleUpdateCV = async () => {
    setSubmitting(true);
    try {
      await apiService.updateCV(cvForm, token || undefined);
      alert('CV updated successfully!');
      setCVEditing(false);
      fetchCV();
    } catch (error) {
      alert('Failed to update CV');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExperience = async () => {
    if (!experienceForm.company || !experienceForm.position || !experienceForm.start_date) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingExperienceId) {
        await apiService.updateExperience(editingExperienceId, experienceForm, token || undefined);
        alert('Experience updated successfully!');
      } else {
        await apiService.addExperience(experienceForm, token || undefined);
        alert('Experience added successfully!');
      }
      setExperienceForm({ company: '', position: '', description: '', start_date: '', end_date: '' });
      setShowExperienceForm(false);
      setEditingExperienceId(null);
      fetchCV();
    } catch (error) {
      alert('Failed to save experience');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      await apiService.deleteExperience(id, token || undefined);
      fetchCV();
    } catch (error) {
      alert('Failed to delete experience');
    }
  };

  const handleAddEducation = async () => {
    if (!educationForm.institution || !educationForm.degree || !educationForm.field || !educationForm.graduation_date) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingEducationId) {
        await apiService.updateEducation(editingEducationId, educationForm, token || undefined);
        alert('Education updated successfully!');
      } else {
        await apiService.addEducation(educationForm, token || undefined);
        alert('Education added successfully!');
      }
      setEducationForm({ institution: '', degree: '', field: '', graduation_date: '' });
      setShowEducationForm(false);
      setEditingEducationId(null);
      fetchCV();
    } catch (error) {
      alert('Failed to save education');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this education?')) return;
    try {
      await apiService.deleteEducation(id, token || undefined);
      fetchCV();
    } catch (error) {
      alert('Failed to delete education');
    }
  };

  const handleAddSkill = async () => {
    if (!skillForm.name) {
      alert('Please enter skill name');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingSkillId) {
        await apiService.updateSkill(editingSkillId, skillForm, token || undefined);
        alert('Skill updated successfully!');
      } else {
        await apiService.addSkill(skillForm, token || undefined);
        alert('Skill added successfully!');
      }
      setSkillForm({ name: '', level: '' });
      setShowSkillForm(false);
      setEditingSkillId(null);
      fetchCV();
    } catch (error) {
      alert('Failed to save skill');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await apiService.deleteSkill(id, token || undefined);
      fetchCV();
    } catch (error) {
      alert('Failed to delete skill');
    }
  };

  const handleAddCertificate = async () => {
    if (!certificateForm.name || !certificateForm.issuer || !certificateForm.issue_date) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingCertificateId) {
        await apiService.updateCertificate(editingCertificateId, certificateForm, token || undefined);
        alert('Certificate updated successfully!');
      } else {
        await apiService.addCertificate(certificateForm, token || undefined);
        alert('Certificate added successfully!');
      }
      setCertificateForm({ name: '', issuer: '', issue_date: '', expiration_date: '', credential_url: '', credential_id: '' });
      setShowCertificateForm(false);
      setEditingCertificateId(null);
      fetchCV();
    } catch (error) {
      alert('Failed to save certificate');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await apiService.deleteCertificate(id, token || undefined);
      fetchCV();
    } catch (error) {
      alert('Failed to delete certificate');
    }
  };

  const handleAddProject = async () => {
    if (!projectForm.title || !projectForm.description) {
      alert('Please fill in title and description');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingProjectId) {
        await apiService.updateProject(editingProjectId, projectForm, token || undefined);
        alert('Project updated successfully!');
      } else {
        await apiService.createProject(projectForm, token || undefined);
        alert('Project added successfully!');
      }
      setProjectForm({ title: '', description: '', github_url: '', project_url: '', technologies: '' });
      setShowProjectForm(false);
      setEditingProjectId(null);
      fetchProjects();
    } catch (error) {
      alert('Failed to save project');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiService.deleteProject(id, token || undefined);
      fetchProjects();
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  const handleEditExperience = (experience: Experience) => {
    setExperienceForm({
      company: experience.company,
      position: experience.position,
      description: experience.description || '',
      start_date: experience.start_date,
      end_date: experience.end_date || ''
    });
    setEditingExperienceId(experience.id);
    setShowExperienceForm(true);
  };

  const handleEditEducation = (education: Education) => {
    setEducationForm({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      graduation_date: education.graduation_date
    });
    setEditingEducationId(education.id);
    setShowEducationForm(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setSkillForm({
      name: skill.name,
      level: skill.level || ''
    });
    setEditingSkillId(skill.id);
    setShowSkillForm(true);
  };

  const handleEditCertificate = (certificate: Certificate) => {
    setCertificateForm({
      name: certificate.name,
      issuer: certificate.issuer,
      issue_date: certificate.issue_date,
      expiration_date: certificate.expiration_date || '',
      credential_url: certificate.credential_url || '',
      credential_id: certificate.credential_id || ''
    });
    setEditingCertificateId(certificate.id);
    setShowCertificateForm(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectForm({
      title: project.title,
      description: project.description || '',
      github_url: project.github_url || '',
      project_url: project.project_url || '',
      technologies: project.technologies || ''
    });
    setEditingProjectId(project.id);
    setShowProjectForm(true);
  };

  const handleDownloadPDF = async () => {
    if (!cv || !user) return;
    setGeneratingPDF(true);
    try {
      generateResumePDF(cv, projects, user.full_name || user.email);
    } catch (error) {
      alert('Failed to generate PDF');
      console.error(error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading || cvLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-primary/20 glow">
          <Link href="/dashboard" className="text-primary hover:text-primary-dark font-medium mb-6 inline-flex items-center transition-colors">
            <span className="mr-2">←</span> Back to Dashboard
          </Link>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">Portfolio Builder</h1>
              <p className="text-text-muted text-lg">
                Create your professional resume and showcase your projects.
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              className="bg-primary hover:bg-primary-dark text-background px-6 py-3 rounded-xl font-medium transition glow disabled:opacity-50 whitespace-nowrap ml-4"
            >
              {generatingPDF ? '📥 Generating...' : '📥 Download PDF'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-primary/20">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'resume'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            📄 Resume/CV
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'projects'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            🚀 Projects
          </button>
        </div>

        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <div className="space-y-8">
            {/* Resume Overview */}
            <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground font-display">Resume Information</h2>
                <button
                  onClick={() => setCVEditing(!cvEditing)}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  {cvEditing ? '✕ Cancel' : '✏️ Edit'}
                </button>
              </div>

              {cvEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Professional Title</label>
                    <input
                      type="text"
                      value={cvForm.title}
                      onChange={(e) => setCVForm({...cvForm, title: e.target.value})}
                      placeholder="e.g. Senior Data Analyst"
                      className="w-full px-4 py-2 bg-surface-light border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        value={cvForm.email}
                        onChange={(e) => setCVForm({...cvForm, email: e.target.value})}
                        className="w-full px-4 py-2 bg-surface-light border border-primary/30 rounded-lg text-foreground focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                      <input
                        type="tel"
                        value={cvForm.phone}
                        onChange={(e) => setCVForm({...cvForm, phone: e.target.value})}
                        placeholder="(+44) 123-456-7890"
                        className="w-full px-4 py-2 bg-surface-light border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                    <input
                      type="text"
                      value={cvForm.location}
                      onChange={(e) => setCVForm({...cvForm, location: e.target.value})}
                      placeholder="City, Country"
                      className="w-full px-4 py-2 bg-surface-light border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        value={cvForm.linkedin_url}
                        onChange={(e) => setCVForm({...cvForm, linkedin_url: e.target.value})}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full px-4 py-2 bg-surface-light border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Personal Website</label>
                      <input
                        type="url"
                        value={cvForm.website_url}
                        onChange={(e) => setCVForm({...cvForm, website_url: e.target.value})}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-4 py-2 bg-surface-light border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Professional Summary</label>
                    <textarea
                      value={cvForm.summary}
                      onChange={(e) => setCVForm({...cvForm, summary: e.target.value})}
                      placeholder="Write a brief summary of your professional background and goals..."
                      rows={4}
                      className="w-full px-4 py-2 bg-surface-light border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <button
                    onClick={handleUpdateCV}
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary-dark text-background px-6 py-3 rounded-xl font-medium transition glow disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Resume Info'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-text-muted text-sm">Professional Title</p>
                    <p className="text-foreground font-medium">{cvForm.title || 'Not set'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-text-muted text-sm">Email</p>
                      <p className="text-foreground">{cvForm.email}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Phone</p>
                      <p className="text-foreground">{cvForm.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Location</p>
                    <p className="text-foreground">{cvForm.location || 'Not set'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-text-muted text-sm">LinkedIn</p>
                      {cvForm.linkedin_url ? (
                        <a href={cvForm.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                          View Profile →
                        </a>
                      ) : (
                        <p className="text-text-muted">Not set</p>
                      )}
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Website</p>
                      {cvForm.website_url ? (
                        <a href={cvForm.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                          Visit Website →
                        </a>
                      ) : (
                        <p className="text-text-muted">Not set</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Professional Summary</p>
                    <p className="text-foreground whitespace-pre-wrap">{cvForm.summary || 'Not set'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Resume Sections */}
            <div className="flex gap-2 border-b border-primary/20 overflow-x-auto -mx-8 px-8 sticky top-0 bg-background/80 backdrop-blur-sm">
              {(['overview', 'experience', 'education', 'skills', 'certificates', 'projects'] as ResumeTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setResumeTab(tab)}
                  className={`px-4 py-2 font-medium text-sm transition capitalize whitespace-nowrap ${
                    resumeTab === tab
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-muted hover:text-foreground'
                  }`}
                >
                  {tab === 'overview' ? '👁️ Overview' : tab === 'experience' ? '💼 Experience' : tab === 'education' ? '🎓 Education' : tab === 'skills' ? '🛠️ Skills' : tab === 'certificates' ? '🏆 Certificates' : '🚀 Projects'}
                </button>
              ))}
            </div>

            {/* Experience Section */}
            {resumeTab === 'experience' && (
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 glow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Work Experience</h3>
                  {!showExperienceForm && (
                    <button
                      onClick={() => {
                        setExperienceForm({ company: '', position: '', description: '', start_date: '', end_date: '' });
                        setEditingExperienceId(null);
                        setShowExperienceForm(true);
                      }}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      + Add Experience
                    </button>
                  )}
                </div>

                {showExperienceForm && (
                  <div className="bg-surface-light rounded-xl p-6 mb-6 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-4">{editingExperienceId ? 'Edit Experience' : 'Add New Experience'}</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Company *</label>
                          <input
                            type="text"
                            value={experienceForm.company}
                            onChange={(e) => setExperienceForm({...experienceForm, company: e.target.value})}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Position *</label>
                          <input
                            type="text"
                            value={experienceForm.position}
                            onChange={(e) => setExperienceForm({...experienceForm, position: e.target.value})}
                            placeholder="e.g. Senior Data Analyst"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Start Date (YYYY-MM) *</label>
                          <input
                            type="text"
                            value={experienceForm.start_date}
                            onChange={(e) => setExperienceForm({...experienceForm, start_date: e.target.value})}
                            placeholder="2020-01"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">End Date (YYYY-MM)</label>
                          <input
                            type="text"
                            value={experienceForm.end_date}
                            onChange={(e) => setExperienceForm({...experienceForm, end_date: e.target.value})}
                            placeholder="2023-12 or Present"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                        <textarea
                          value={experienceForm.description}
                          onChange={(e) => setExperienceForm({...experienceForm, description: e.target.value})}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={4}
                          className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddExperience}
                          disabled={submitting}
                          className="flex-1 bg-primary hover:bg-primary-dark text-background px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {submitting ? 'Saving...' : editingExperienceId ? 'Update' : 'Add'}
                        </button>
                        <button
                          onClick={() => {
                            setShowExperienceForm(false);
                            setEditingExperienceId(null);
                            setExperienceForm({ company: '', position: '', description: '', start_date: '', end_date: '' });
                          }}
                          className="flex-1 bg-surface-light hover:bg-surface border border-primary/30 text-foreground px-4 py-2 rounded-lg font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {cv?.experiences && cv.experiences.length > 0 ? (
                    cv.experiences.map((exp) => (
                      <div key={exp.id} className="border border-primary/20 rounded-lg p-4 hover:bg-surface-light/50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground">{exp.position}</h4>
                            <p className="text-primary text-sm">{exp.company}</p>
                            <p className="text-text-muted text-sm">{exp.start_date} - {exp.end_date || 'Present'}</p>
                            {exp.description && <p className="text-text-muted text-sm mt-2">{exp.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditExperience(exp)}
                              className="text-primary hover:text-primary-dark text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="text-secondary hover:text-red-400 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-center py-8">No experience added yet. Add your first work experience!</p>
                  )}
                </div>
              </div>
            )}

            {/* Education Section */}
            {resumeTab === 'education' && (
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 glow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Education</h3>
                  {!showEducationForm && (
                    <button
                      onClick={() => {
                        setEducationForm({ institution: '', degree: '', field: '', graduation_date: '' });
                        setEditingEducationId(null);
                        setShowEducationForm(true);
                      }}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      + Add Education
                    </button>
                  )}
                </div>

                {showEducationForm && (
                  <div className="bg-surface-light rounded-xl p-6 mb-6 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-4">{editingEducationId ? 'Edit Education' : 'Add New Education'}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Institution *</label>
                        <input
                          type="text"
                          value={educationForm.institution}
                          onChange={(e) => setEducationForm({...educationForm, institution: e.target.value})}
                          placeholder="e.g. University of London"
                          className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Degree *</label>
                          <input
                            type="text"
                            value={educationForm.degree}
                            onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})}
                            placeholder="e.g. Bachelor of Science"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Field of Study *</label>
                          <input
                            type="text"
                            value={educationForm.field}
                            onChange={(e) => setEducationForm({...educationForm, field: e.target.value})}
                            placeholder="e.g. Data Science"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Graduation Date (YYYY-MM) *</label>
                        <input
                          type="text"
                          value={educationForm.graduation_date}
                          onChange={(e) => setEducationForm({...educationForm, graduation_date: e.target.value})}
                          placeholder="2022-06"
                          className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddEducation}
                          disabled={submitting}
                          className="flex-1 bg-primary hover:bg-primary-dark text-background px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {submitting ? 'Saving...' : editingEducationId ? 'Update' : 'Add'}
                        </button>
                        <button
                          onClick={() => {
                            setShowEducationForm(false);
                            setEditingEducationId(null);
                            setEducationForm({ institution: '', degree: '', field: '', graduation_date: '' });
                          }}
                          className="flex-1 bg-surface-light hover:bg-surface border border-primary/30 text-foreground px-4 py-2 rounded-lg font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {cv?.educations && cv.educations.length > 0 ? (
                    cv.educations.map((edu) => (
                      <div key={edu.id} className="border border-primary/20 rounded-lg p-4 hover:bg-surface-light/50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground">{edu.degree} in {edu.field}</h4>
                            <p className="text-primary text-sm">{edu.institution}</p>
                            <p className="text-text-muted text-sm">Graduated: {edu.graduation_date}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditEducation(edu)}
                              className="text-primary hover:text-primary-dark text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteEducation(edu.id)}
                              className="text-secondary hover:text-red-400 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-center py-8">No education added yet. Add your educational background!</p>
                  )}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {resumeTab === 'skills' && (
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 glow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Skills</h3>
                  {!showSkillForm && (
                    <button
                      onClick={() => {
                        setSkillForm({ name: '', level: '' });
                        setEditingSkillId(null);
                        setShowSkillForm(true);
                      }}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      + Add Skill
                    </button>
                  )}
                </div>

                {showSkillForm && (
                  <div className="bg-surface-light rounded-xl p-6 mb-6 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-4">{editingSkillId ? 'Edit Skill' : 'Add New Skill'}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Skill Name *</label>
                        <input
                          type="text"
                          value={skillForm.name}
                          onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                          placeholder="e.g. Python"
                          className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Level</label>
                        <select
                          value={skillForm.level}
                          onChange={(e) => setSkillForm({...skillForm, level: e.target.value})}
                          className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option value="">Select level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddSkill}
                          disabled={submitting}
                          className="flex-1 bg-primary hover:bg-primary-dark text-background px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {submitting ? 'Saving...' : editingSkillId ? 'Update' : 'Add'}
                        </button>
                        <button
                          onClick={() => {
                            setShowSkillForm(false);
                            setEditingSkillId(null);
                            setSkillForm({ name: '', level: '' });
                          }}
                          className="flex-1 bg-surface-light hover:bg-surface border border-primary/30 text-foreground px-4 py-2 rounded-lg font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {cv?.skills && cv.skills.length > 0 ? (
                    cv.skills.map((skill) => (
                      <div key={skill.id} className="border border-primary/20 rounded-lg p-4 bg-surface-light/50 hover:border-primary/50 hover:bg-surface-light transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground">{skill.name}</h4>
                            {skill.level && <p className="text-text-muted text-sm capitalize">{skill.level}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSkill(skill)}
                              className="text-primary hover:text-primary-dark text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="text-secondary hover:text-red-400 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-center py-8 col-span-full">No skills added yet. Start building your skill profile!</p>
                  )}
                </div>
              </div>
            )}

            {/* Certificates Section */}
            {resumeTab === 'certificates' && (
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 glow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Certifications</h3>
                  {!showCertificateForm && (
                    <button
                      onClick={() => {
                        setCertificateForm({ name: '', issuer: '', issue_date: '', expiration_date: '', credential_url: '', credential_id: '' });
                        setEditingCertificateId(null);
                        setShowCertificateForm(true);
                      }}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      + Add Certificate
                    </button>
                  )}
                </div>

                {showCertificateForm && (
                  <div className="bg-surface-light rounded-xl p-6 mb-6 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-4">{editingCertificateId ? 'Edit Certificate' : 'Add New Certificate'}</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Certificate Name *</label>
                          <input
                            type="text"
                            value={certificateForm.name}
                            onChange={(e) => setCertificateForm({...certificateForm, name: e.target.value})}
                            placeholder="e.g. AWS Certified Solutions Architect"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Issuing Organization *</label>
                          <input
                            type="text"
                            value={certificateForm.issuer}
                            onChange={(e) => setCertificateForm({...certificateForm, issuer: e.target.value})}
                            placeholder="e.g. Amazon Web Services"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Issue Date (YYYY-MM) *</label>
                          <input
                            type="text"
                            value={certificateForm.issue_date}
                            onChange={(e) => setCertificateForm({...certificateForm, issue_date: e.target.value})}
                            placeholder="2021-06"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Expiration Date (YYYY-MM)</label>
                          <input
                            type="text"
                            value={certificateForm.expiration_date}
                            onChange={(e) => setCertificateForm({...certificateForm, expiration_date: e.target.value})}
                            placeholder="Leave blank if no expiration"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Credential URL</label>
                          <input
                            type="url"
                            value={certificateForm.credential_url}
                            onChange={(e) => setCertificateForm({...certificateForm, credential_url: e.target.value})}
                            placeholder="https://..."
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Credential ID</label>
                          <input
                            type="text"
                            value={certificateForm.credential_id}
                            onChange={(e) => setCertificateForm({...certificateForm, credential_id: e.target.value})}
                            placeholder="e.g. AWSC-123456"
                            className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddCertificate}
                          disabled={submitting}
                          className="flex-1 bg-primary hover:bg-primary-dark text-background px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {submitting ? 'Saving...' : editingCertificateId ? 'Update' : 'Add'}
                        </button>
                        <button
                          onClick={() => {
                            setShowCertificateForm(false);
                            setEditingCertificateId(null);
                            setCertificateForm({ name: '', issuer: '', issue_date: '', expiration_date: '', credential_url: '', credential_id: '' });
                          }}
                          className="flex-1 bg-surface-light hover:bg-surface border border-primary/30 text-foreground px-4 py-2 rounded-lg font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {cv?.certificates && cv.certificates.length > 0 ? (
                    cv.certificates.map((cert) => (
                      <div key={cert.id} className="border border-primary/20 rounded-lg p-4 hover:bg-surface-light/50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground">{cert.name}</h4>
                            <p className="text-primary text-sm">{cert.issuer}</p>
                            <p className="text-text-muted text-sm">Issued: {cert.issue_date}{cert.expiration_date ? ` | Expires: ${cert.expiration_date}` : ''}</p>
                            {cert.credential_url && (
                              <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark text-sm inline-block mt-2">
                                View Credential →
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCertificate(cert)}
                              className="text-primary hover:text-primary-dark text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteCertificate(cert.id)}
                              className="text-secondary hover:text-red-400 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-center py-8">No certifications added yet. Add your professional certifications!</p>
                  )}
                </div>
              </div>
            )}

            {/* Projects Section in Resume */}
            {resumeTab === 'projects' && (
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 glow">
                <h3 className="text-xl font-bold text-foreground mb-6">Featured Projects</h3>
                {projects && projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className="border border-primary/20 rounded-xl p-6 bg-surface-light/50 hover:border-primary/50 hover:bg-surface-light transition">
                        <h4 className="text-lg font-bold text-foreground mb-2">{project.title}</h4>
                        <p className="text-text-muted text-sm mb-4">{project.description}</p>

                        {project.technologies && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {project.technologies.split(',').map((tech) => (
                              <span
                                key={tech.trim()}
                                className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30 font-medium"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-dark text-sm font-medium"
                            >
                              🔗 GitHub
                            </a>
                          )}
                          {project.project_url && (
                            <a
                              href={project.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-dark text-sm font-medium"
                            >
                              🌐 Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-center py-8">No projects yet. Add projects to showcase your work in your resume!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground font-display">Your Projects</h2>
                {!showProjectForm && (
                  <button
                    onClick={() => {
                      setProjectForm({ title: '', description: '', github_url: '', project_url: '', technologies: '' });
                      setEditingProjectId(null);
                      setShowProjectForm(true);
                    }}
                    className="bg-primary hover:bg-primary-dark text-background px-6 py-3 rounded-xl font-medium transition text-sm glow"
                  >
                    + Add Project
                  </button>
                )}
              </div>

              {showProjectForm && (
                <div className="bg-surface-light rounded-xl p-6 mb-8 border border-primary/20">
                  <h3 className="font-medium text-foreground mb-4 text-lg">{editingProjectId ? 'Edit Project' : 'Add New Project'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Project Title *</label>
                      <input
                        type="text"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                        placeholder="e.g. E-commerce Data Analysis"
                        className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                      <textarea
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                        placeholder="Describe your project, what you built, and what you learned..."
                        rows={4}
                        className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">GitHub URL</label>
                        <input
                          type="url"
                          value={projectForm.github_url}
                          onChange={(e) => setProjectForm({...projectForm, github_url: e.target.value})}
                          placeholder="https://github.com/username/project"
                          className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Project URL / Live Demo</label>
                        <input
                          type="url"
                          value={projectForm.project_url}
                          onChange={(e) => setProjectForm({...projectForm, project_url: e.target.value})}
                          placeholder="https://myproject.com"
                          className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Technologies (comma-separated)</label>
                      <input
                        type="text"
                        value={projectForm.technologies}
                        onChange={(e) => setProjectForm({...projectForm, technologies: e.target.value})}
                        placeholder="e.g. Python, Pandas, React, Flask"
                        className="w-full px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddProject}
                        disabled={submitting}
                        className="flex-1 bg-primary hover:bg-primary-dark text-background px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
                      >
                        {submitting ? 'Saving...' : editingProjectId ? 'Update Project' : 'Add Project'}
                      </button>
                      <button
                        onClick={() => {
                          setShowProjectForm(false);
                          setEditingProjectId(null);
                          setProjectForm({ title: '', description: '', github_url: '', project_url: '', technologies: '' });
                        }}
                        className="flex-1 bg-surface-light hover:bg-surface border border-primary/30 text-foreground px-6 py-3 rounded-xl font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-primary/20 rounded-xl p-6 bg-surface-light/50 hover:border-primary/50 hover:bg-surface-light transition">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-foreground flex-1">{project.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProject(project)}
                            className="text-primary hover:text-primary-dark text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-secondary hover:text-red-400 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <p className="text-text-muted text-sm mb-4">{project.description}</p>

                      {project.technologies && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {project.technologies.split(',').map((tech) => (
                            <span
                              key={tech.trim()}
                              className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30 font-medium"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 flex-wrap">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            🔗 GitHub
                          </a>
                        )}
                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            🌐 Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center bg-surface-light/50">
                  <div className="text-primary mb-4">
                    <div className="text-5xl">🚀</div>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No projects added yet</h3>
                  <p className="text-text-muted mb-6">Add your first project to showcase your skills</p>
                  <button
                    onClick={() => {
                      setProjectForm({ title: '', description: '', github_url: '', project_url: '', technologies: '' });
                      setEditingProjectId(null);
                      setShowProjectForm(true);
                    }}
                    className="bg-primary hover:bg-primary-dark text-background px-6 py-3 rounded-xl font-medium transition glow"
                  >
                    Add Your First Project
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
