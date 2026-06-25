import { asyncHandler } from '../../shared/middlewares/index.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/utils/index.js';
import optionGroupService from './option-group.service.js';

class OptionGroupController {
  constructor(service) {
    this.service = service;
  }

  list = asyncHandler(async (req, res) => {
    const groups = await this.service.listByStore(req.params.storeId);
    sendSuccess(res, groups);
  });

  create = asyncHandler(async (req, res) => {
    const group = await this.service.create(req.params.storeId, req.body);
    sendCreated(res, group);
  });

  update = asyncHandler(async (req, res) => {
    const group = await this.service.update(
      req.params.storeId,
      req.params.groupId,
      req.body,
    );
    sendSuccess(res, group);
  });

  remove = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.storeId, req.params.groupId);
    sendNoContent(res);
  });

  createOption = asyncHandler(async (req, res) => {
    const option = await this.service.createOption(
      req.params.storeId,
      req.params.groupId,
      req.body,
    );
    sendCreated(res, option);
  });

  updateOption = asyncHandler(async (req, res) => {
    const option = await this.service.updateOption(
      req.params.storeId,
      req.params.groupId,
      req.params.optionId,
      req.body,
    );
    sendSuccess(res, option);
  });

  removeOption = asyncHandler(async (req, res) => {
    await this.service.deleteOption(
      req.params.storeId,
      req.params.groupId,
      req.params.optionId,
    );
    sendNoContent(res);
  });
}

export default new OptionGroupController(optionGroupService);
