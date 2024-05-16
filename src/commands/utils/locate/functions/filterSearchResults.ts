import { ApplicationCommandOptionChoiceData } from 'discord.js';
import { Panel } from '../panels/panel';

export const filterSearchResults = (query: string, source: Map<string, Panel>) => {
    // Get any target that includes the query string.
    const possibleTargets = Array.from(source.keys()).filter((current) => current.toLowerCase().includes(query.toLowerCase()));

    // Sort possible targets based on the length of the match. -> More equal characters between query and target = higher ranking
    possibleTargets.sort((a, b) => a.indexOf(query) - b.indexOf(query));

    // Remove all targets that are not preceded by a hyphen, or where .substring(0) !== query.
    const filteredTargets = possibleTargets.filter((current) => {
        const indexOfQuery = current.indexOf(query);

        if (indexOfQuery === 0) return true;

        return current.charAt(indexOfQuery - 1) === '-';
    });

    // Limit the number of returned targets to 25. (Discord limitation)
    const choices: ApplicationCommandOptionChoiceData<string | number>[] = [];
    for (let i = 0; i < filteredTargets.length && i < 25; i++) {
        choices.push({ name: filteredTargets[i], value: filteredTargets[i] });
    }

    return choices;
};
