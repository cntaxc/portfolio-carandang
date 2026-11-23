import { answerQuestion, ASSISTANT_SUGGESTIONS } from './portfolioAssistant';
import knowledgeBase from '../data/knowledge-base.generated.json';

const topicOf = (question, context) => answerQuestion(question, context).topic;

describe('portfolio assistant', () => {
  test.each([
    ['Who is Christian?', 'identity'],
    ['Tell me about Christian', 'identity'],
    ['What did he study?', 'education'],
    ['Where did Christian go to school?', 'education'],
    ['What are his strongest skills?', 'skills'],
    ["What's his tech stack?", 'skills'],
    ['How can I contact him?', 'contact'],
    ["What's his GitHub?", 'contact'],
    ['Is he available for hire?', 'contact'],
    ['Tell me about his projects', 'projects'],
    ['What games has he made?', 'projects'],
    ['How many years of experience does he have?', 'experience'],
    ['What organizations was he part of?', 'experience'],
    ['Has he won any hackathons?', 'achievements'],
    ['Show me his 3D models', 'models'],
    ['Where is he based?', 'location'],
    ['What does he do?', 'roles'],
    ['What can you do?', 'assistant'],
    ['hello', 'greeting'],
    ['thanks!', 'thanks'],
    ['Hi! What did he study?', 'education'],
    ['What is the capital of France?', 'fallback'],
    ['Write me a poem', 'fallback'],
  ])('%s -> %s', (question, topic) => {
    expect(topicOf(question)).toBe(topic);
  });

  test('every suggestion button gets a real answer', () => {
    for (const suggestion of ASSISTANT_SUGGESTIONS) {
      expect(topicOf(suggestion)).not.toBe('fallback');
    }
  });

  test('answers about a project by name, with its link', () => {
    const { text, topic, context } = answerQuestion('Tell me about OUTRUN');
    expect(topic).toBe('project');
    expect(text).toContain('UI Designer, Front-End Developer & 3D Artist');
    expect(text).toContain('https://ninesixfour.itch.io/outrun');
    expect(context.project).toBe('OUTRUN');
  });

  test('understands follow-ups about the last project', () => {
    const { context } = answerQuestion('What is MUTED?');
    const followUp = answerQuestion('What tools did it use?', context);
    expect(followUp.topic).toBe('project');
    expect(followUp.text).toContain('ONNX Runtime');
  });

  test('answers about a specific skill with its level and projects', () => {
    const { text, topic } = answerQuestion('Is he good at React?');
    expect(topic).toBe('skill');
    expect(text).toContain('Intermediate');
    expect(text).toContain('LUNAS');
  });

  test('does not confuse Next.js with JavaScript, or GitHub with Git', () => {
    expect(answerQuestion('Does he know Next.js?').text).not.toContain('JavaScript');
    expect(answerQuestion('Is he good with GitHub?').text).not.toMatch(/lists Git at/);
  });

  test('says when an asked-about technology is not on the skills list', () => {
    expect(answerQuestion('Does he know Rust?').text).toMatch(/^I don't see that/);
    expect(answerQuestion('What are his strongest skills?').text).not.toMatch(/^I don't see that/);
  });

  test('knows project tools that are not on the skills list', () => {
    const { text, topic } = answerQuestion('Has he used Prisma?');
    expect(topic).toBe('tool');
    expect(text).toContain('LUNAS');
  });

  test('answers about skill areas, organizations, model categories and models', () => {
    expect(answerQuestion('What are his frontend skills?').text).toContain('HTML/CSS');
    expect(answerQuestion('What did he do at DEVCON?').text).toContain('DEVCON Laguna');
    expect(answerQuestion('What vehicle models has he made?').text).toContain('Tricycle');
    expect(answerQuestion('Did he model a jeep?').text).toContain('Jeep');
  });

  test('never invents contact details', () => {
    const { text } = answerQuestion('How can I reach him?');
    expect(text).toContain(knowledgeBase.contact.email);
    expect(text).toContain(knowledgeBase.contact.linkedin);
  });

  test('handles empty and odd input without throwing', () => {
    for (const question of ['', '   ', '???', 'c# c++ <script>', 'a'.repeat(600)]) {
      expect(typeof answerQuestion(question).text).toBe('string');
    }
  });
});
