import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AIService } from '../src/services/ai/aiService.js';

describe('AI Service Request Assistant & Fallback Parser', () => {
  it('should extract plumbing intent with date, time, and budget', async () => {
    const input = 'My kitchen sink is leaking heavily, need someone tomorrow morning, budget around 600';
    const result = await AIService.extractServiceRequest(input, 'Indiranagar');

    assert.equal(result.category, 'Plumbing');
    assert.equal(result.preferredTime, 'Morning');
    assert.equal(result.budget, 600);
    assert.ok(result.description.includes('kitchen sink is leaking'));
    assert.ok(
      result.suggestedSkills.length > 0 &&
      (result.suggestedSkills.some(s => /leak|pipe|tap|plumb|sink|repair/i.test(s)) || result.category === 'Plumbing')
    );
  });

  it('should extract electrical intent and evening slot', async () => {
    const input = 'Switchboard is sparking in the living room, please visit in the evening, budget 450';
    const result = await AIService.extractServiceRequest(input, 'Koramangala');

    assert.equal(result.category, 'Electrical');
    assert.equal(result.preferredTime, 'Evening');
    assert.equal(result.budget, 450);
  });

  it('should extract cleaning service intent', async () => {
    const input = 'Need full 2BHK deep cleaning this weekend, budget 1200';
    const result = await AIService.extractServiceRequest(input, 'Indiranagar');

    assert.equal(result.category, 'Cleaning');
    assert.equal(result.budget, 1200);
  });

  it('should provide default values for vague inputs without crashing', async () => {
    const input = 'Help needed with home repairs';
    const result = await AIService.extractServiceRequest(input, 'Indiranagar');

    assert.ok(result.category);
    assert.ok(result.budget >= 50);
    assert.ok(result.preferredDate);
  });
});
