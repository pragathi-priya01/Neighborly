import { Service } from '../models/Service.js';
import { ApiError } from '../utils/apiError.js';

export class ServiceCatalogService {
  static async listServices(query = {}) {
    const filter = { active: true };
    if (query.category) {
      filter.category = new RegExp(query.category, 'i');
    }
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, 'i') },
        { description: new RegExp(query.search, 'i') },
        { category: new RegExp(query.search, 'i') },
      ];
    }

    return Service.find(filter).sort({ category: 1, name: 1 });
  }

  static async getServiceById(id) {
    const service = await Service.findById(id);
    if (!service) {
      throw ApiError.notFound('Service category not found');
    }
    return service;
  }

  static async createService(data) {
    const existing = await Service.findOne({ name: data.name });
    if (existing) {
      throw ApiError.conflict('A service with this name already exists');
    }
    return Service.create(data);
  }

  static async updateService(id, data) {
    const service = await Service.findByIdAndUpdate(id, data, { new: true });
    if (!service) {
      throw ApiError.notFound('Service category not found');
    }
    return service;
  }

  static async deleteService(id) {
    const service = await Service.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!service) {
      throw ApiError.notFound('Service category not found');
    }
    return service;
  }
}
