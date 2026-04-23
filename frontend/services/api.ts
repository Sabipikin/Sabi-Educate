const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  full_name?: string;
  region: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  instructor_id: number;
  duration_hours: number;
  prerequisites?: string;
  fee: number;
  promo_amount?: number;
  is_on_promo?: boolean;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content?: string;
  video_url?: string;
  order: number;
  duration_minutes: number;
  created_at: string;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order: number;
}

export interface ContentItem {
  id: number;
  title: string;
  description?: string;
  content_type: string;
  order: number;
  is_required: boolean;
  video_url?: string;
  duration_minutes?: number;
  notes_content?: string;
  slides_url?: string;
  assessment_type?: string;
  total_questions?: number;
  passing_score?: number;
  time_limit_minutes?: number;
  progress: {
    view_progress_percentage: number;
    is_completed: boolean;
    time_spent_minutes: number;
  };
}

export interface Question {
  id: number;
  content_id: number;
  question_text: string;
  question_type: string;
  order: number;
  options?: string[] | string;
  correct_answer?: string;
  sample_answer?: string;
  points: number;
}

export interface AssessmentSubmissionResult {
  status: string;
  assessment_id: number;
  score: number;
  total_points: number;
  percentage: number;
  is_passing: boolean;
  message: string;
}

export interface ContentProgressResponse {
  id: number;
  user_id: number;
  content_id: number;
  started_at: string;
  completed_at?: string;
  updated_at: string;
  view_progress_percentage: number;
  time_spent_minutes: number;
  is_completed: boolean;
}

export interface CanEnrollResponse {
  can_enroll: boolean;
  reason: string;
  requires_payment?: boolean;
  price?: number;
  promo_amount?: number;
  final_price?: number;
  enrollment_id?: number;
  status?: string;
}

export interface MyEnrollmentResponse {
  id: number;
  user_id: number;
  course_id: number;
  status: string;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  progress_percentage: number;
}

export interface CourseProgressDetailResponse {
  enrollment_id: number;
  course_id: number;
  course_title: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  modules: Array<{
    module_id: number;
    module_title: string;
    total_items: number;
    completed_items: number;
    progress_percentage: number;
  }>;
}

export interface StartLearningResponse {
  message: string;
  enrollment_id: number;
  status: string;
  first_module_id?: number;
  started_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
}

export interface Progress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  time_spent_minutes: number;
  view_progress_percentage: number;
  completed_at?: string;
  created_at: string;
}

export interface Project {
  id: number;
  portfolio_id: number;
  title: string;
  description?: string;
  github_url?: string;
  project_url?: string;
  technologies?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: number;
  cv_id: number;
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface Education {
  id: number;
  cv_id: number;
  institution: string;
  degree: string;
  field: string;
  graduation_date: string;
  created_at: string;
}

export interface Skill {
  id: number;
  cv_id: number;
  name: string;
  level?: string;
  created_at: string;
}

export interface Certificate {
  id: number;
  cv_id: number;
  name: string;
  issuer: string;
  issue_date: string;
  expiration_date?: string;
  credential_url?: string;
  credential_id?: string;
  created_at: string;
}

export interface CV {
  id: number;
  portfolio_id: number;
  title?: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  linkedin_url?: string;
  website_url?: string;
  status: string;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  certificates: Certificate[];
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: number;
  user_id: number;
  headline?: string;
  bio?: string;
  status: string;
  projects: Project[];
  cv?: CV;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async signup(
    email: string,
    password: string,
    full_name: string,
    region: string = 'uk'
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, region }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(token: string): Promise<User> {
    return this.request<User>('/api/auth/me', {}, token);
  }

  // Course methods
  async getCourses(token?: string, category?: string, difficulty?: string): Promise<Course[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Course[]>(`/api/courses/${query}`, {}, token);
  }

  async getCourse(courseId: number, token?: string): Promise<Course> {
    return this.request<Course>(`/api/courses/${courseId}`, {}, token);
  }

  async createCourse(courseData: {
    title: string;
    description?: string;
    category: string;
    difficulty?: string;
    duration_hours?: number;
    prerequisites?: string;
  }, token?: string): Promise<Course> {
    return this.request<Course>('/api/courses/', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }, token);
  }

  async canEnrollCourse(courseId: number, token?: string): Promise<CanEnrollResponse> {
    return this.request<CanEnrollResponse>(`/api/enrollments/${courseId}/can-enroll`, {}, token);
  }

  async enrollCourse(courseId: number, token?: string, paymentId?: number): Promise<Enrollment | { message: string; id: number; status: string; enrolled_at: string }> {
    return this.request<Enrollment | { message: string; id: number; status: string; enrolled_at: string }>(`/api/enrollments/${courseId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId }),
    }, token);
  }

  async getMyEnrollment(courseId: number, token?: string): Promise<MyEnrollmentResponse> {
    return this.request<MyEnrollmentResponse>(`/api/enrollments/${courseId}/my-enrollment`, {}, token);
  }

  async startLearning(courseId: number, token?: string): Promise<StartLearningResponse> {
    return this.request<StartLearningResponse>(`/api/enrollments/${courseId}/start-learning`, {
      method: 'POST',
    }, token);
  }

  async getCourseModules(courseId: number, token?: string): Promise<Module[]> {
    return this.request<Module[]>(`/api/enrollments/${courseId}/modules`, {}, token);
  }

  async getModuleContent(courseId: number, moduleId: number, token?: string): Promise<ContentItem[]> {
    return this.request<ContentItem[]>(`/api/enrollments/${courseId}/module/${moduleId}/content`, {}, token);
  }

  async getAssessmentQuestions(contentId: number, token?: string): Promise<Question[]> {
    return this.request<Question[]>(`/api/assessments/content/${contentId}/questions`, {}, token);
  }

  async submitAssessmentAnswers(contentId: number, answers: Record<number, string>, token?: string): Promise<AssessmentSubmissionResult> {
    return this.request<AssessmentSubmissionResult>('/api/assessments/submit-answers', {
      method: 'POST',
      body: JSON.stringify({ content_id: contentId, answers }),
    }, token);
  }

  async getCourseProgress(courseId: number, token?: string): Promise<CourseProgressDetailResponse> {
    return this.request<CourseProgressDetailResponse>(`/api/enrollments/${courseId}/course-progress`, {}, token);
  }

  async updateContentProgress(contentId: number, viewProgressPercentage: number, isCompleted: boolean, timeSpentMinutes: number, token?: string): Promise<ContentProgressResponse> {
    return this.request<ContentProgressResponse>(`/api/enrollments/content/${contentId}/progress`, {
      method: 'POST',
      body: JSON.stringify({
        view_progress_percentage: viewProgressPercentage,
        time_spent_minutes: timeSpentMinutes,
        is_completed: isCompleted,
      }),
    }, token);
  }

  async getEnrolledCourses(token?: string): Promise<{ enrollment: Enrollment; course: Course }[]> {
    return this.request<{ enrollment: Enrollment; course: Course }[]>('/api/courses/enrolled', {}, token);
  }

  async getCourseLessons(courseId: number, token?: string): Promise<Lesson[]> {
    return this.request<Lesson[]>(`/api/courses/${courseId}/lessons`, {}, token);
  }

  async completeLesson(lessonId: number, token?: string): Promise<Progress> {
    return this.request<Progress>(`/api/courses/lessons/${lessonId}/complete`, {
      method: 'POST',
    }, token);
  }

  async updateLessonProgress(lessonId: number, viewProgressPercentage: number, token?: string): Promise<any> {
    return this.request<any>(`/api/courses/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ view_progress_percentage: viewProgressPercentage }),
    }, token);
  }

  // Portfolio methods
  async getPortfolio(token?: string): Promise<Portfolio> {
    return this.request<Portfolio>('/api/portfolio/', {}, token);
  }

  async updatePortfolio(data: { headline?: string; bio?: string; status?: string }, token?: string): Promise<Portfolio> {
    return this.request<Portfolio>('/api/portfolio/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async getProjects(token?: string): Promise<Project[]> {
    return this.request<Project[]>('/api/portfolio/projects', {}, token);
  }

  async createProject(data: any, token?: string): Promise<Project> {
    return this.request<Project>('/api/portfolio/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getProject(projectId: number, token?: string): Promise<Project> {
    return this.request<Project>(`/api/portfolio/projects/${projectId}`, {}, token);
  }

  async updateProject(projectId: number, data: any, token?: string): Promise<Project> {
    return this.request<Project>(`/api/portfolio/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteProject(projectId: number, token?: string): Promise<any> {
    return this.request<any>(`/api/portfolio/projects/${projectId}`, {
      method: 'DELETE',
    }, token);
  }

  async getCV(token?: string): Promise<CV> {
    return this.request<CV>('/api/portfolio/cv', {}, token);
  }

  async updateCV(data: any, token?: string): Promise<CV> {
    return this.request<CV>('/api/portfolio/cv', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async addExperience(data: any, token?: string): Promise<Experience> {
    return this.request<Experience>('/api/portfolio/cv/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async updateExperience(experienceId: number, data: any, token?: string): Promise<Experience> {
    return this.request<Experience>(`/api/portfolio/cv/experiences/${experienceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteExperience(experienceId: number, token?: string): Promise<any> {
    return this.request<any>(`/api/portfolio/cv/experiences/${experienceId}`, {
      method: 'DELETE',
    }, token);
  }

  async addEducation(data: any, token?: string): Promise<Education> {
    return this.request<Education>('/api/portfolio/cv/educations', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async updateEducation(educationId: number, data: any, token?: string): Promise<Education> {
    return this.request<Education>(`/api/portfolio/cv/educations/${educationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteEducation(educationId: number, token?: string): Promise<any> {
    return this.request<any>(`/api/portfolio/cv/educations/${educationId}`, {
      method: 'DELETE',
    }, token);
  }

  async addSkill(data: any, token?: string): Promise<Skill> {
    return this.request<Skill>('/api/portfolio/cv/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async updateSkill(skillId: number, data: any, token?: string): Promise<Skill> {
    return this.request<Skill>(`/api/portfolio/cv/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteSkill(skillId: number, token?: string): Promise<any> {
    return this.request<any>(`/api/portfolio/cv/skills/${skillId}`, {
      method: 'DELETE',
    }, token);
  }

  async addCertificate(data: any, token?: string): Promise<Certificate> {
    return this.request<Certificate>('/api/portfolio/cv/certificates', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async updateCertificate(certificateId: number, data: any, token?: string): Promise<Certificate> {
    return this.request<Certificate>(`/api/portfolio/cv/certificates/${certificateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteCertificate(certificateId: number, token?: string): Promise<any> {
    return this.request<any>(`/api/portfolio/cv/certificates/${certificateId}`, {
      method: 'DELETE',
    }, token);
  }

  // Gamification API
  async getGamificationStats(token?: string): Promise<any> {
    return this.request<any>('/api/gamification/stats', {
      method: 'GET',
    }, token);
  }

  async awardPoints(lessonId: number, token?: string): Promise<any> {
    return this.request<any>('/api/gamification/points/award', {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId }),
    }, token);
  }

  async getLeaderboard(): Promise<any> {
    return this.request<any>('/api/gamification/leaderboard', {
      method: 'GET',
    });
  }

  async checkBadges(token?: string): Promise<any> {
    return this.request<any>('/api/gamification/badges/check', {
      method: 'POST',
    }, token);
  }

  async resetWeeklyPoints(token?: string): Promise<any> {
    return this.request<any>('/api/gamification/weekly-reset', {
      method: 'GET',
    }, token);
  }

  // User API
  async updateUserRegion(region: string, token?: string): Promise<User> {
    return this.request<User>('/api/auth/region', {
      method: 'PUT',
      body: JSON.stringify({ region }),
    }, token);
  }
}

export const apiService = new ApiService();
