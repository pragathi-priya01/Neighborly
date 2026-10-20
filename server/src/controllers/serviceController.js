import { ServiceCatalogService } from '../services/serviceCatalogService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ServiceController {
  static async list(req, res, next) {
    try {
      const services = await ServiceCatalogService.listServices(req.query);
      return ApiResponse.success(res, services);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const service = await ServiceCatalogService.getServiceById(req.params.id);
      return ApiResponse.success(res, service);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const service = await ServiceCatalogService.createService(req.body);
      return ApiResponse.created(res, service, 'Service category created');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const service = await ServiceCatalogService.updateService(req.params.id, req.body);
      return ApiResponse.success(res, service, 'Service category updated');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await ServiceCatalogService.deleteService(req.params.id);
      return ApiResponse.success(res, null, 'Service deactivated');
    } catch (error) {
      next(error);
    }
  }
}
