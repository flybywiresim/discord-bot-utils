import { EmbedField } from 'discord.js';

export interface Panel {
  /**
   * The name of the Panel. This should be usable in sentences.
   */
  name: string;

  /**
   * The title of the Panel. -> Used as the embed title.
   */
  title: string;

  /**
   * Optional description for a panel such as instructions on aligning the ADIRSs.
   */
  description?: EmbedField;

  /**
   * The URL to the relevant documentation.
   */
  docsUrl: string;

  /**
   * The URL to documentation of the flight deck this panel belongs to.
   */
  flightDeckUrl: string;

  /**
   * The URL to the image that shows the location of this panel.
   */
  imageUrl: string;

  /**
   * The search queries that lead to this panel.
   */
  identifiers: string[];
}
