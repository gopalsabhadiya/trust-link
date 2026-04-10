import { readFile } from "node:fs/promises";
import path from "node:path";
import Handlebars from "handlebars";
import {
  ExperienceLetterSchema,
  type IExperienceLetter,
} from "@trustlink/shared";

const EXPERIENCE_LETTER_TEMPLATE_RELATIVE = path.join(
  "templates",
  "credentials",
  "experience-letter.hbs"
);

export interface RenderExperienceLetterInput extends IExperienceLetter {
  digitalTrustSeal: string;
}

export class TemplateService {
  private experienceLetterTemplate: Handlebars.TemplateDelegate<RenderExperienceLetterInput> | null =
    null;

  private async loadExperienceLetterTemplate(): Promise<
    Handlebars.TemplateDelegate<RenderExperienceLetterInput>
  > {
    if (this.experienceLetterTemplate) return this.experienceLetterTemplate;

    const templateCandidates = [
      path.resolve(process.cwd(), "src", EXPERIENCE_LETTER_TEMPLATE_RELATIVE),
      path.resolve(__dirname, "..", EXPERIENCE_LETTER_TEMPLATE_RELATIVE),
      path.resolve(process.cwd(), "dist", EXPERIENCE_LETTER_TEMPLATE_RELATIVE),
    ];

    let templateSource = "";
    let lastError: unknown;

    for (const candidatePath of templateCandidates) {
      try {
        templateSource = await readFile(candidatePath, "utf8");
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!templateSource) {
      throw new Error(
        `Experience letter template not found. Last error: ${String(lastError)}`
      );
    }

    this.experienceLetterTemplate = Handlebars.compile<RenderExperienceLetterInput>(
      templateSource,
      { noEscape: false }
    );

    return this.experienceLetterTemplate;
  }

  async renderExperienceLetter(
    content: IExperienceLetter,
    digitalTrustSeal: string
  ): Promise<string> {
    const safeContent = ExperienceLetterSchema.parse(content);
    const template = await this.loadExperienceLetterTemplate();
    return template({
      ...safeContent,
      digitalTrustSeal,
    });
  }
}
