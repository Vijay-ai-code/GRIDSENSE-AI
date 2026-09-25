// =============================================================================
// GridSense AI - Validation Middleware
// Validates incoming HTTP payloads against Zod schemas.
// =============================================================================

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'The provided electrical or operational parameters failed validation.',
        details: result.error.flatten().fieldErrors
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  validateBody
};
