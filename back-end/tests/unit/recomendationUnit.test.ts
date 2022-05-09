import { jest } from '@jest/globals';
import { recommendationService } from '../../src/services/recommendationsService.js';
import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';

describe('recommendations service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('send conflict error when recommendation already exist', async () => {
    const recommendation = {
      id: 1,
      name: 'Imagine Dragons - Bones',
      youtubeLink: 'https://www.youtube.com/watch?v=DYed5whEf4g',
      score: 0,
    };

    jest.spyOn(recommendationRepository, 'findByName').mockResolvedValue(recommendation);

    expect(async () => {
      await recommendationService.insert(recommendation);
    }).rejects.toEqual({
      message: 'Recommendations names must be unique',
      type: 'conflict',
    });
  });

  it('send not found error when not found recommendation id for an up vote', async () => {
    jest.spyOn(recommendationRepository, 'find').mockResolvedValue(null);

    expect(async () => {
      await recommendationService.upvote(1);
    }).rejects.toEqual({ message: '', type: 'not_found' });
  });

  it('send not found error when not found recommendation id for a down vote', async () => {
    jest.spyOn(recommendationRepository, 'find').mockResolvedValue(null);

    expect(async () => {
      await recommendationService.downvote(1);
    }).rejects.toEqual({ message: '', type: 'not_found' });
  });

  it('delete recommendation if a downvote is lower then -5', async () => {
    const recommendation = {
      id: 1,
      name: 'Imagine Dragons - Bones',
      youtubeLink: 'https://www.youtube.com/watch?v=DYed5whEf4g',
      score: -5,
    };

    jest.spyOn(recommendationRepository, 'find').mockResolvedValue(recommendation);
    jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValue({ ...recommendation, score: -6 });

    const remove = jest.spyOn(recommendationRepository, 'remove')
      .mockResolvedValue(null);

    await recommendationService.downvote(1);

    expect(recommendationRepository.remove).toBeCalledWith(
      recommendation.id,
    );
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('send not found error when recommendation getRandom', async () => {
    jest.spyOn(recommendationService, 'getScoreFilter').mockReturnValue('lte');
    jest.spyOn(recommendationService, 'getByScore').mockResolvedValue([]);
    jest.spyOn(recommendationRepository, 'findAll').mockResolvedValue([]);

    expect(async () => {
      await recommendationService.getRandom();
    }).rejects.toEqual({ message: '', type: 'not_found' });
  });
});
