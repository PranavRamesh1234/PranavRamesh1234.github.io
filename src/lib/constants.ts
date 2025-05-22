export const categories = [
  { value: 'school-textbooks', label: 'School Textbooks & Reference Guides' },
  { value: 'competitive-exams', label: 'Competitive Exams & Government Job Prep' },
  { value: 'engineering-medical', label: 'Engineering & Medical Entrance (JEE / NEET)' },
  { value: 'college-textbooks', label: 'College & University Textbooks' },
  { value: 'fiction', label: 'Fiction (English & Indian Languages)' },
  { value: 'self-help', label: 'Self-Help & Personal Growth' },
  { value: 'business', label: 'Business, Career & Entrepreneurship' },
  { value: 'language-learning', label: 'Regional & Language Learning' },
  { value: 'comics-manga', label: 'Comics, Manga & Illustrated Books' },
  { value: 'arts-hobbies', label: 'Arts, Hobbies & Skill Development' },
] as const;

export type Category = typeof categories[number]['value'];

export const boards = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'];
export const classLevels = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
]; 