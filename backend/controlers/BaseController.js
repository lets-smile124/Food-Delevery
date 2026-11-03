class BaseController {
  /**
   * Send JSON success response
   * @param {import("express").Response} res
   * @param {object|string} payload
   * @param {number} [status=200]
   */
  sendSuccess(res, payload = {}, status = 200) {
    if (typeof payload === "string") {
      return res.status(status).json({
        success: true,
        message: payload
      });
    }

    return res.status(status).json({
      success: true,
      ...payload
    });
  }

  /**
   * Send JSON error response
   * @param {import("express").Response} res
   * @param {string} message
   * @param {number} [status=200]
   * @param {any} [error=null]
   */
  sendError(res, message = "Error", status = 200, error = null) {
    if (error) {
      console.error(`[${this.constructor.name} Error]:`, error.message || error);
    }

    return res.status(status).json({
      success: false,
      message
    });
  }

  /**
   * Catch block error handler
   * @param {import("express").Response} res
   * @param {any} error
   * @param {string} [defaultMessage="Error"]
   */
  handleError(res, error, defaultMessage = "Error") {
    return this.sendError(res, defaultMessage, 200, error);
  }
}

export default BaseController;

