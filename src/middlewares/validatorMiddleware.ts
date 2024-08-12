import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { articleSchemaPost, articleSchemaPut } from "../validationSchemas/articleValidationSchema";

export const schemaValidator = (schema: z.AnyZodObject | z.ZodEffects<z.AnyZodObject>) => async function (req: Request, res: Response, next: NextFunction): Promise<Response | undefined | never> {
    try {
        const articleData = req.body;
        const validationResult = await schema.safeParseAsync(articleData);
        if (!validationResult.success) {
            const errors = validationResult.error.issues;
             //.error.formErrors.fieldErrors;
            return res.status(500).json({ errors });
        }
        next()
    } catch (error: any) {
        res.status(500).json({ error: "Ha ocurrido un error en el proceso de validación" });
    }
}
