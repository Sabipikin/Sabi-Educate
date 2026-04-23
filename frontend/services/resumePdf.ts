import { CV, Project, Experience, Education, Skill, Certificate } from './api';

export function generateResumePDF(cv: CV, projects: Project[], userName: string) {
  // Create HTML content for the resume
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Resume - ${userName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 8.5in;
          margin: 0;
          padding: 0.5in;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 1rem;
        }
        .name {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
        }
        .title {
          font-size: 14px;
          color: #0066cc;
          margin: 0.25rem 0;
        }
        .contact-info {
          font-size: 12px;
          color: #666;
          margin: 0.5rem 0;
        }
        .contact-info a {
          color: #0066cc;
          text-decoration: none;
        }
        .summary {
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f5f5f5;
          border-left: 3px solid #0066cc;
        }
        .section {
          margin-bottom: 1rem;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #fff;
          background: #0066cc;
          padding: 0.5rem;
          margin: 1rem 0 0.5rem 0;
        }
        .entry {
          margin-bottom: 0.8rem;
          font-size: 11px;
        }
        .entry-title {
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 0.2rem;
        }
        .entry-subtitle {
          font-style: italic;
          color: #666;
          margin-bottom: 0.2rem;
        }
        .entry-date {
          color: #999;
          font-size: 10px;
          margin-bottom: 0.2rem;
        }
        .entry-description {
          color: #333;
          line-height: 1.4;
          margin-bottom: 0.3rem;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          margin: 0.3rem 0;
        }
        .tag {
          background: #e0e0e0;
          color: #333;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 10px;
        }
        .skill-item {
          display: inline-block;
          margin-right: 1rem;
          margin-bottom: 0.5rem;
          font-size: 11px;
        }
        .skill-name {
          font-weight: bold;
          margin-right: 0.3rem;
        }
        .skill-level {
          color: #666;
          font-size: 10px;
        }
        .project-list {
          margin-top: 0.5rem;
        }
        .url {
          color: #0066cc;
          text-decoration: none;
          font-size: 10px;
          word-break: break-all;
        }
        @media print {
          body {
            padding: 0.3in;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${userName}</div>
        ${cv.title ? `<div class="title">${cv.title}</div>` : ''}
        <div class="contact-info">
          ${cv.email ? `<span>${cv.email}</span>` : ''}
          ${cv.phone ? `<span> | ${cv.phone}</span>` : ''}
          ${cv.location ? `<span> | ${cv.location}</span>` : ''}
          <br>
          ${cv.linkedin_url ? `<a href="${cv.linkedin_url}">LinkedIn</a>` : ''}
          ${cv.website_url ? `${cv.linkedin_url ? ' | ' : ''}<a href="${cv.website_url}">Website</a>` : ''}
        </div>
      </div>

      ${cv.summary ? `
      <div class="summary">
        ${cv.summary}
      </div>
      ` : ''}

      ${cv.experiences && cv.experiences.length > 0 ? `
      <div class="section">
        <div class="section-title">EXPERIENCE</div>
        ${cv.experiences.map(exp => `
          <div class="entry">
            <div class="entry-title">${exp.position}</div>
            <div class="entry-subtitle">${exp.company}</div>
            <div class="entry-date">${exp.start_date} - ${exp.end_date || 'Present'}</div>
            ${exp.description ? `<div class="entry-description">${exp.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${cv.educations && cv.educations.length > 0 ? `
      <div class="section">
        <div class="section-title">EDUCATION</div>
        ${cv.educations.map(edu => `
          <div class="entry">
            <div class="entry-title">${edu.degree} in ${edu.field}</div>
            <div class="entry-subtitle">${edu.institution}</div>
            <div class="entry-date">Graduated: ${edu.graduation_date}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${cv.skills && cv.skills.length > 0 ? `
      <div class="section">
        <div class="section-title">SKILLS</div>
        <div>
          ${cv.skills.map(skill => `
            <div class="skill-item">
              <span class="skill-name">${skill.name}</span>
              ${skill.level ? `<span class="skill-level">(${skill.level})</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${cv.certificates && cv.certificates.length > 0 ? `
      <div class="section">
        <div class="section-title">CERTIFICATIONS</div>
        ${cv.certificates.map(cert => `
          <div class="entry">
            <div class="entry-title">${cert.name}</div>
            <div class="entry-subtitle">${cert.issuer}</div>
            <div class="entry-date">Issued: ${cert.issue_date}${cert.expiration_date ? ` | Expires: ${cert.expiration_date}` : ''}</div>
            ${cert.credential_url ? `<div><a href="${cert.credential_url}" class="url">View Credential</a></div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${projects && projects.length > 0 ? `
      <div class="section">
        <div class="section-title">PROJECTS</div>
        ${projects.map(project => `
          <div class="entry">
            <div class="entry-title">${project.title}</div>
            ${project.description ? `<div class="entry-description">${project.description}</div>` : ''}
            ${project.technologies ? `
              <div class="tags">
                ${project.technologies.split(',').map(tech => `<span class="tag">${tech.trim()}</span>`).join('')}
              </div>
            ` : ''}
            ${project.github_url || project.project_url ? `
              <div>
                ${project.github_url ? `<a href="${project.github_url}" class="url">GitHub</a>` : ''}
                ${project.project_url ? `${project.github_url ? ' | ' : ''}<a href="${project.project_url}" class="url">Live Demo</a>` : ''}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
    </body>
    </html>
  `;

  // Create a blob from the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Open print dialog
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 1000);
  };
}
