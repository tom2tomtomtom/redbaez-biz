import { CreatomateService, CreatomateRenderOptions } from '../creatomateService';
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
    LLM: 'llm',
    OPENAI: 'openai',
    CREATOMATE: 'creatomate'
  }
}));

// Mock WebSocketService
jest.mock('../WebSocketService', () => ({
  webSocketService: {
    broadcast: jest.fn()
  }
}));

describe('CreatomateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env.CREATOMATE_API_KEY = 'test-api-key';
    process.env.PROTOTYPE_MODE = 'false';

    // Mock apiKeyManager to return a valid key
    (apiKeyManager.getKey as jest.Mock).mockReturnValue('test-api-key');
    (apiKeyManager.isConfigured as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    // Reset environment variables
    delete process.env.CREATOMATE_API_KEY;
    delete process.env.PROTOTYPE_MODE;
  });

  describe('isConfigured', () => {
    it('should return true when API key is configured', () => {
      expect(creatomateService.isConfigured()).toBe(true);
    });

    it('should return false when API key is not configured', () => {
      (apiKeyManager.isConfigured as jest.Mock).mockReturnValue(false);
      expect(creatomateService.isConfigured()).toBe(false);
    });
  });

  describe('generateVideo', () => {
    it('should call Creatomate API and return a job', async () => {
      // Mock successful API response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          id: 'test-job-id',
          status: 'queued'
        }
      });

      const options: CreatomateRenderOptions = {
        templateId: 'test-template-id',
        outputFormat: 'mp4',
        modifications: {
          text1: 'Test Text',
          image1: 'https://example.com/image.jpg'
        }
      };

      const result = await creatomateService.generateVideo(options);

      // Verify API was called with correct parameters
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.creatomate.com/v1/renders',
        {
          source: {
            template_id: 'test-template-id',
            modifications: options.modifications
          },
          output_format: 'mp4'
        },
        {
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        }
      );

      // Verify result
      expect(result).toEqual({
        id: 'test-job-id',
        status: 'queued'
      });
    });

    it('should return mock data when in prototype mode', async () => {
      // Set prototype mode
      process.env.PROTOTYPE_MODE = 'true';

      const options: CreatomateRenderOptions = {
        templateId: 'test-template-id',
        outputFormat: 'mp4',
        modifications: {
          text1: 'Test Text'
        }
      };

      const result = await creatomateService.generateVideo(options);

      // Verify API was not called
      expect(mockedAxios.post).not.toHaveBeenCalled();

      // Verify result has expected structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status', 'queued');
    });

    it('should throw an error when API call fails', async () => {
      // Mock failed API response
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      const options: CreatomateRenderOptions = {
        templateId: 'test-template-id',
        outputFormat: 'mp4',
        modifications: {
          text1: 'Test Text'
        }
      };

      await expect(creatomateService.generateVideo(options)).rejects.toThrow('Failed to generate video');
    });
  });

  describe('checkRenderStatus', () => {
    it('should call Creatomate API and return job status', async () => {
      // Mock successful API response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 'test-job-id',
          status: 'completed',
          url: 'https://example.com/video.mp4',
          thumbnails: ['https://example.com/thumbnail.jpg']
        }
      });

      const result = await creatomateService.checkRenderStatus('test-job-id');

      // Verify API was called with correct parameters
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.creatomate.com/v1/renders/test-job-id',
        {
          headers: {
            'Authorization': 'Bearer test-api-key'
          }
        }
      );

      // Verify result
      expect(result).toEqual({
        id: 'test-job-id',
        status: 'completed',
        url: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        error: undefined
      });
    });

    it('should throw an error when API call fails', async () => {
      // Mock failed API response
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(creatomateService.checkRenderStatus('test-job-id')).rejects.toThrow('Failed to check render status');
    });
  });
});
