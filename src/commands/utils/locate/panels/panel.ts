export interface Panel {
    /**
     * The name of the Panel. This should be able to be used in sentences.
     */
    name: string;

    /**
     * The title of the Panel. - Will be used as the embed title.
     */
    title: string;

    /**
     * The URL to the relevant documentation.
     */
    docsUrl: string;

    /**
     * The URL to documentation of the flight this panel belongs to.
     */
    flightDeckUrl: string;

    /**
     * The path to the image that shows the location of this panel.
     */
    imagePath: string;

    /**
     * The search queries that lead to this panel.
     */
    identifiers: string[];
}
