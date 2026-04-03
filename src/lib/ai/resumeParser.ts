export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    startDate?: string;
    endDate?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year?: string;
    gpa?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  languages?: string[];
  links?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

/**
 * Parse resume text and extract structured information
 */
export async function parseResume(text: string): Promise<ParsedResume> {
  const resume: ParsedResume = {
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  };

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    resume.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    resume.phone = phoneMatch[0];
  }

  // Extract name (usually first line or before email)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 50 && !firstLine.includes('@')) {
      resume.name = firstLine;
    }
  }

  // Extract skills
  resume.skills = extractSkills(text);

  // Extract experience
  resume.experience = extractExperience(text);

  // Extract education
  resume.education = extractEducation(text);

  // Extract projects
  resume.projects = extractProjects(text);

  // Extract certifications
  resume.certifications = extractCertifications(text);

  // Extract links
  resume.links = extractLinks(text);

  // Extract location
  const locationMatch = text.match(/(?:Location|Address):\s*([^\n]+)/i);
  if (locationMatch) {
    resume.location = locationMatch[1].trim();
  }

  return resume;
}

/**
 * Extract skills from resume text
 */
function extractSkills(text: string): string[] {
  const skills = new Set<string>();

  // Common skill keywords
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Sass',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'REST API', 'GraphQL', 'WebSocket',
    'Agile', 'Scrum', 'Jira',
  ];

  // Look for skills section
  const skillsSection = text.match(/(?:Skills|Technical Skills|Core Competencies):\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i);
  
  if (skillsSection) {
    const skillText = skillsSection[1];
    skillKeywords.forEach(skill => {
      if (new RegExp(`\\b${skill}\\b`, 'i').test(skillText)) {
        skills.add(skill);
      }
    });
  }

  // Also check entire document
  skillKeywords.forEach(skill => {
    if (new RegExp(`\\b${skill}\\b`, 'i').test(text)) {
      skills.add(skill);
    }
  });

  return Array.from(skills);
}

/**
 * Extract work experience
 */
function extractExperience(text: string): ParsedResume['experience'] {
  const experience: ParsedResume['experience'] = [];

  // Look for experience section
  const expSection = text.match(/(?:Experience|Work Experience|Employment History):([\s\S]*?)(?=\n(?:Education|Projects|Skills|Certifications)|$)/i);
  
  if (!expSection) return experience;

  const expText = expSection[1];
  const entries = expText.split(/\n(?=[A-Z])/);

  entries.forEach(entry => {
    const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return;

    // Try to parse job title and company
    const titleMatch = lines[0].match(/^(.+?)(?:\s+[-–|]\s+|\s+at\s+)(.+)$/i);
    
    if (titleMatch) {
      const [, title, company] = titleMatch;
      const duration = lines[1] || '';
      const description = lines.slice(2).join(' ');

      experience.push({
        title: title.trim(),
        company: company.trim(),
        duration: duration.trim(),
        description: description.trim(),
      });
    }
  });

  return experience;
}

/**
 * Extract education
 */
function extractEducation(text: string): ParsedResume['education'] {
  const education: ParsedResume['education'] = [];

  // Look for education section
  const eduSection = text.match(/(?:Education|Academic Background):([\s\S]*?)(?=\n(?:Experience|Projects|Skills|Certifications)|$)/i);
  
  if (!eduSection) return education;

  const eduText = eduSection[1];
  const entries = eduText.split(/\n(?=[A-Z])/);

  entries.forEach(entry => {
    const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const degreeMatch = lines[0].match(/(Bachelor|Master|PhD|B\.Tech|M\.Tech|B\.S|M\.S|BA|MA).*?(?:\s+in\s+)?([^,\n]+)/i);
    const institution = lines[1] || lines[0];
    const yearMatch = entry.match(/\b(19|20)\d{2}\b/);

    education.push({
      degree: degreeMatch ? degreeMatch[0] : lines[0],
      institution: institution,
      year: yearMatch ? yearMatch[0] : undefined,
    });
  });

  return education;
}

/**
 * Extract projects
 */
function extractProjects(text: string): ParsedResume['projects'] {
  const projects: ParsedResume['projects'] = [];

  // Look for projects section
  const projSection = text.match(/(?:Projects|Personal Projects|Key Projects):([\s\S]*?)(?=\n(?:Experience|Education|Skills|Certifications)|$)/i);
  
  if (!projSection) return projects;

  const projText = projSection[1];
  const entries = projText.split(/\n(?=[A-Z•-])/);

  entries.forEach(entry => {
    const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const name = lines[0].replace(/^[•-]\s*/, '');
    const description = lines.slice(1).join(' ');

    projects.push({
      name,
      description,
    });
  });

  return projects;
}

/**
 * Extract certifications
 */
function extractCertifications(text: string): ParsedResume['certifications'] {
  const certifications: ParsedResume['certifications'] = [];

  // Look for certifications section
  const certSection = text.match(/(?:Certifications|Certificates|Professional Certifications):([\s\S]*?)(?=\n(?:Experience|Education|Skills|Projects)|$)/i);
  
  if (!certSection) return certifications;

  const certText = certSection[1];
  const entries = certText.split(/\n(?=[A-Z•-])/);

  entries.forEach(entry => {
    const clean = entry.replace(/^[•-]\s*/, '').trim();
    if (!clean) return;

    const parts = clean.split(/[-–|,]/);
    
    certifications.push({
      name: parts[0]?.trim() || clean,
      issuer: parts[1]?.trim() || '',
      date: parts[2]?.trim(),
    });
  });

  return certifications;
}

/**
 * Extract social/professional links
 */
function extractLinks(text: string): ParsedResume['links'] {
  const links: ParsedResume['links'] = {};

  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) {
    links.linkedin = `https://${linkedinMatch[0]}`;
  }

  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) {
    links.github = `https://${githubMatch[0]}`;
  }

  const portfolioMatch = text.match(/(?:portfolio|website):\s*(https?:\/\/[^\s]+)/i);
  if (portfolioMatch) {
    links.portfolio = portfolioMatch[1];
  }

  return links;
}

/**
 * Parse PDF resume
 */
export async function parsePDFResume(_file: File): Promise<ParsedResume> {
  // This would integrate with a PDF parsing library
  // For now, return a mock implementation
  throw new Error('PDF parsing requires pdf-parse library');
}

/**
 * Parse DOCX resume
 */
export async function parseDOCXResume(_file: File): Promise<ParsedResume> {
  // This would integrate with a DOCX parsing library
  // For now, return a mock implementation
  throw new Error('DOCX parsing requires mammoth library');
}

export default {
  parseResume,
  parsePDFResume,
  parseDOCXResume,
};