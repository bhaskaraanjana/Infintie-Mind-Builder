/**
 * Onboarding Seed Data
 * Pre-populates the canvas with example notes for first-time users.
 */

import type { Note, Cluster, Link } from './types';

export const generateOnboardingData = () => {
    const now = Date.now();

    // Use FIXED IDs so onboarding data is idempotent (no duplicates)
    const hubNoteId = 'onboarding-hub-note';
    const fleetingNoteId = 'onboarding-fleeting-note';
    const literatureNoteId = 'onboarding-literature-note';
    const permanentNoteId = 'onboarding-permanent-note';
    const clusterId = 'onboarding-cluster';

    // --- Notes ---
    const notes: Note[] = [
        {
            id: hubNoteId,
            type: 'hub',
            x: 0,
            y: 0,
            title: '🧠 Getting Started',
            content: `<p>Welcome to <strong>Infinite Mind</strong>! This is your command center.</p>
<p><strong>Hub Notes</strong> organize related ideas. Check out the connected notes to learn more!</p>
<ul>
  <li>🎉 <em>Fleeting Note</em> → Quick thoughts</li>
  <li>📚 <em>Literature Note</em> → Sources & books</li>
  <li>💡 <em>Permanent Note</em> → Your insights</li>
</ul>
<p>Try <strong>double-clicking</strong> anywhere on the canvas to create your own note!</p>`,
            tags: ['onboarding', 'hub'],
            created: now,
            modified: now,
            references: [fleetingNoteId, literatureNoteId, permanentNoteId],
        },
        {
            id: fleetingNoteId,
            type: 'fleeting',
            x: -450,
            y: -200,
            title: '✨ Welcome!',
            content: `<p>This is a <strong>Fleeting Note</strong> – for quick, raw ideas.</p>
<p>Fleeting notes are temporary. Process them into permanent knowledge or delete them!</p>
<p><em>Tip: Use the toolbar to convert this into a Permanent or Literature note.</em></p>`,
            tags: ['onboarding', 'tip'],
            created: now,
            modified: now,
            references: [],
        },
        {
            id: literatureNoteId,
            type: 'literature',
            x: 450,
            y: -200,
            title: 'Atomic Habits – James Clear',
            content: `<p>"Tiny changes lead to remarkable results."</p>
<p>This is a <strong>Literature Note</strong> – notes connected to a source (book, article, video).</p>`,
            tags: ['onboarding', 'books', 'productivity'],
            created: now,
            modified: now,
            references: [permanentNoteId],
            sourcesMetadata: [{
                id: 'onboarding-source-1',
                title: 'Atomic Habits',
                author: 'James Clear',
                publishedDate: '2018',
                url: 'https://jamesclear.com/atomic-habits'
            }],
        },
        {
            id: permanentNoteId,
            type: 'permanent',
            x: 450,
            y: 250,
            title: '💡 Habit Stacking',
            content: `<p>Link a new habit to an existing routine:</p>
<blockquote><p>After [CURRENT HABIT], I will [NEW HABIT].</p></blockquote>
<p>This is a <strong>Permanent Note</strong> – your synthesized, atomic insights. Built to last!</p>`,
            tags: ['onboarding', 'insight', 'habits'],
            created: now,
            modified: now,
            references: [],
            clusterId: clusterId,
        },
    ];

    // Update literature note to be in cluster
    notes[2].clusterId = clusterId;

    // --- Cluster ---
    const clusters: Cluster[] = [
        {
            id: clusterId,
            title: '📦 Productivity',
            x: 450,
            y: 25, // Centered between Literature (y:-200) and Permanent (y:250)
            children: [literatureNoteId, permanentNoteId],
            color: '#3B82F6', // Blue
            modified: now,
        },
    ];

    // --- Links ---
    const links: Link[] = [
        {
            id: 'onboarding-link-1',
            sourceId: hubNoteId,
            targetId: fleetingNoteId,
            style: 'dashed',
            shape: 'curved',
            arrowDirection: 'forward',
            label: 'start here',
            modified: now,
        },
        {
            id: 'onboarding-link-2',
            sourceId: hubNoteId,
            targetId: clusterId, // Link to cluster orb
            style: 'dashed',
            shape: 'curved',
            arrowDirection: 'forward',
            label: 'explore',
            modified: now,
        },
        {
            id: 'onboarding-link-3',
            sourceId: literatureNoteId,
            targetId: permanentNoteId,
            style: 'solid',
            shape: 'curved',
            arrowDirection: 'forward',
            label: 'inspired',
            modified: now,
        },
    ];

    return { notes, clusters, links };
};
