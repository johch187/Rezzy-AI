import type { ProfileData, ParsedCoverLetter } from '../../types';

export const coverLetterToMarkdown = (data: ParsedCoverLetter): string => {
    if (!data) return '';
    let md = '';
    if (data.senderName) md += `${data.senderName}\n`;
    if (data.senderAddress) md += `${data.senderAddress}\n`;
    if (data.senderContact) md += `${data.senderContact}\n\n`;
    if (data.date) md += `${data.date}\n\n`;
    if (data.recipientName) md += `${data.recipientName}\n`;
    if (data.recipientTitle) md += `${data.recipientTitle}\n`;
    if (data.companyName) md += `${data.companyName}\n`;
    if (data.companyAddress) md += `${data.companyAddress}\n\n`;
    if (data.salutation) md += `${data.salutation}\n\n`;
    if (data.body) md += `${data.body}\n\n`;
    if (data.closing) md += `${data.closing}\n`;
    if (data.signature) md += `${data.signature}\n`;
    return md.trim();
};

export const profileToMarkdown = (data: Partial<ProfileData>, order: string[]): string => {
    if (!data) return '';
    let md = '';

    // Header is always first and not part of the reorderable sections
    if (data.fullName) md += `# ${data.fullName}\n`;
    const contactInfo = [data.phone, data.email, data.website, data.location].filter(Boolean);
    if (contactInfo.length > 0) md += `${contactInfo.join(' | ')}\n\n`;

    const renderSection = (key: string): string => {
        let sectionMd = '';
        switch (key) {
            case 'summary':
                if (data.summary) sectionMd += `## Summary\n${data.summary}\n\n`;
                break;
            case 'experience':
                if (data.experience && data.experience.length > 0) {
                    sectionMd += '## Experience\n';
                    data.experience.forEach(exp => {
                        sectionMd += `**${exp.title}** | ${exp.company} | ${exp.location || ''}\n`;
                        if (exp.startDate || exp.endDate) sectionMd += `*${exp.startDate} - ${exp.endDate}*\n\n`;
                        (exp.achievements || []).forEach(ach => {
                            sectionMd += `- ${ach.text}\n`;
                        });
                        sectionMd += '\n';
                    });
                }
                break;
            case 'education':
                if (data.education && data.education.length > 0) {
                    sectionMd += '## Education\n';
                    data.education.forEach(edu => {
                        sectionMd += `**${edu.degree || ''}, ${edu.fieldOfStudy || ''}** | ${edu.institution || ''}\n`;
                        if (edu.startDate || edu.endDate) sectionMd += `*${edu.startDate} - ${edu.endDate}*\n\n`;
                    });
                }
                break;
            case 'skills':
                const allSkills = [
                    ...(data.technicalSkills || []),
                    ...(data.softSkills || []),
                    ...(data.tools || [])
                ];
                if (allSkills.length > 0) {
                    sectionMd += '## Skills\n';
                    sectionMd += allSkills.map(s => s.name).join(', ') + '\n\n';
                }
                break;
            case 'projects':
                if (data.projects && data.projects.length > 0) {
                    sectionMd += '## Projects\n';
                    data.projects.forEach(proj => {
                        sectionMd += `**${proj.name}**\n`;
                        if (proj.description) sectionMd += `${proj.description}\n`;
                        if (proj.technologiesUsed) sectionMd += `*Technologies: ${proj.technologiesUsed}*\n`;
                        sectionMd += '\n';
                    });
                }
                break;
            case 'certifications':
                if (data.certifications && data.certifications.length > 0) {
                    sectionMd += '## Certifications\n';
                    data.certifications.forEach(cert => {
                        sectionMd += `- ${cert.name}\n`;
                    });
                    sectionMd += '\n';
                }
                break;
            case 'languages':
                 if (data.languages && data.languages.length > 0) {
                    sectionMd += '## Languages\n';
                    data.languages.forEach(lang => {
                        sectionMd += `- ${lang.name} (${lang.proficiency})\n`;
                    });
                    sectionMd += '\n';
                }
                break;
        }
        return sectionMd;
    };

    order.forEach(key => {
        md += renderSection(key);
    });

    return md.trim();
};

export const formatContentForDisplay = (text: string) => {
    return text.split('\n\n').map(paragraph => 
        `<p class="mb-4">${paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>`
    ).join('');
};