import { LLMService } from '../llmService';
import axios from 'axios';
import { apiKeyManager, ApiService } from '../../utils/ApiKeyManager';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock apiKeyManager
jest.mock('../../utils/ApiKeyManager', () => ({
  apiKeyManager: {
    getKey: jest.fn(),
    isConfigured: jest.fn()
  },
  ApiService: {
    LLM: 'LLM',
    OPENAI: 'OPENAI'
  }
}));

describe('LLMService', () => {
  let service: LLMService;
  const validApiKey = 'sk-test-api-key-12345678901234567890';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock apiKeyManager to return a valid key
    (apiKeyManager.getKey as jest.Mock).mockReturnValue(validApiKey);
    (apiKeyManager.isConfigured as jest.Mock).mockReturnValue(true);
    
    // Create a new instance for testing
    service = new LLMService();
  });

  describe('isConfigured', () => {
    it('should return true when API key is configured', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when API key is not configured', () => {
      (apiKeyManager.isConfigured as jest.Mock).mockReturnValue(false);
      expect(service.isConfigured()).toBe(false);
    });
  });

  describe('generateText', () => {
    it('should call OpenAI API and return generated text', async () => {
      // Mock successful API response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Generated text response'
              }
            }
          ]
        }
      });

      const prompt = 'Generate a marketing tagline for a new product';
      const result = await service.generateText(prompt);

      // Verify API was called with correct parameters
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: expect.any(String) },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${validApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Verify result
      expect(result).toBe('Generated text response');
    });

    it('should return mock data when in prototype mode', async () => {
      // Set prototype mode
      process.env.PROTOTYPE_MODE = 'true';

      const prompt = 'Generate a marketing tagline for a new product';
      const result = await service.generateText(prompt);

      // Verify API was not called
      expect(mockedAxios.post).not.toHaveBeenCalled();

      // Verify result is a non-empty string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw an error when API call fails', async () => {
      // Mock failed API response
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      const prompt = 'Generate a marketing tagline for a new product';
      
      await expect(service.generateText(prompt)).rejects.toThrow('Failed to generate text');
    });
  });

  describe('generateCopy', () => {
    it('should call OpenAI API with structured prompt and return generated copy', async () => {
      // Mock successful API response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  headline: 'Amazing Headline',
                  subheadline: 'Compelling subheadline',
                  body: 'Detailed body text'
                })
              }
            }
          ]
        }
      });

      const params = {
        product: 'Smart Watch',
        audience: 'Tech enthusiasts',
        tone: 'Professional',
        keyPoints: ['Long battery life', 'Health tracking']
      };
      
      const result = await service.generateCopy(params);

      // Verify API was called with correct parameters
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: expect.any(String) },
            { role: 'user', content: expect.stringContaining('Smart Watch') }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${validApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Verify result structure
      expect(result).toHaveProperty('headline', 'Amazing Headline');
      expect(result).toHaveProperty('subheadline', 'Compelling subheadline');
      expect(result).toHaveProperty('body', 'Detailed body text');
    });

    it('should handle API response that is not valid JSON', async () => {
      // Mock API response with non-JSON content
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Not a JSON response'
              }
            }
          ]
        }
      });

      const params = {
        product: 'Smart Watch',
        audience: 'Tech enthusiasts',
        tone: 'Professional',
        keyPoints: ['Long battery life', 'Health tracking']
      };
      
      // Should return a fallback object with the raw content
      const result = await service.generateCopy(params);
      
      expect(result).toHaveProperty('raw');
      expect(result.raw).toBe('Not a JSON response');
    });
  });
});
