import { ApplicationCommandOptionChoiceData } from 'discord.js';
import { Panel } from '../panels/panel';

export const filterSearchResults = (query: string, source: Map<string, Panel>) => {
    const filteredTargets = Array.from(source.keys()).filter((current) => current.toLowerCase().startsWith(query.toLowerCase()));

    filteredTargets.sort((a, b) => a.indexOf(query) - b.indexOf(query));

    const choices: ApplicationCommandOptionChoiceData<string | number>[] = [];
    for (let i = 0; i < Math.min(filteredTargets.length, 25); i++) {
        choices.push({ name: filteredTargets[i], value: filteredTargets[i] });
    }

    return choices;
};
