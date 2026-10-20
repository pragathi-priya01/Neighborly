import { AIService } from '../services/ai/aiService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AIController {
  static async extractRequest(req, res, next) {
    try {
      const { prompt, neighborhood } = req.body;
      const userNeighborhood = neighborhood || req.user?.neighborhood || 'Indiranagar';

      const extraction = await AIService.extractServiceRequest(prompt, userNeighborhood);
      return ApiResponse.success(res, extraction, 'Service details successfully parsed');
    } catch (error) {
      // In accordance with AI Failure Strategy (Prompt Section 35):
      // Return a graceful error with manual fallback instructions, never crash
      return res.status(200).json({
        success: false,
        message: 'Could not automatically analyze request. Please fill in the details manually.',
        fallback: true,
        data: {
          category: 'General Service',
          description: req.body.prompt || '',
          preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          preferredTime: 'Morning',
          budget: 500,
          neighborhood: req.user?.neighborhood || 'Indiranagar',
        },
      });
    }
  }

  static async matchProviders(req, res, next) {
    try {
      const recommendations = await AIService.matchProvidersForRequest(req.body);
      return ApiResponse.success(res, recommendations, 'Provider recommendations calculated');
    } catch (error) {
      next(error);
    }
  }
}
