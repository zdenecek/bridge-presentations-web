import { Position } from '@/bridge/model/Position';
import { generateCustom, generate } from '@bridge-tools/generator';
import { Types } from '@bridge-tools/core';


export interface DealLike {
    [Position.North]: string;
    [Position.East]: string;
    [Position.South]: string;
    [Position.West]: string;
}

interface CardLike {
    suit: string;
    rank: string;
}

export function generateDeal(): DealLike {
    const deal = generate({});
    const hand = deal[0];
    const suitOrder = ['S', 'H', 'D', 'C'];

    function handToString(cards: CardLike[]): string {
        return suitOrder
            .map(suit =>
                cards
                    .filter(card => card.suit === suit)
                    .map(card => card.rank)
                    .join('')
            )
            .map(s => s === '' ? '-' : s)
            .join(' ');
    }

    return {
        [Position.North]: handToString(hand.N),
        [Position.East]: handToString(hand.E),
        [Position.South]: handToString(hand.S),
        [Position.West]: handToString(hand.W),
    };
}

export function generateDealWithCards(cards: DealLike): DealLike {
    // Parse the string representations back to card objects
    function stringToCards(handString: string): Types.Card[] {
        if (!handString.trim()) return [];
        
        const cards: Types.Card[] = [];
        const suitOrder = ['S', 'H', 'D', 'C'];
        const suits = handString.split(' ');
        
        suits.forEach((suitCards, suitIndex) => {
            if (suitCards === '-' || !suitCards) return;
            
            const suit = suitOrder[suitIndex];
            for (const rank of suitCards) {
                // Create card using the same pattern as the working generateDeal function
                cards.push({ suit, rank } as Types.Card);
            }
        });
        
        return cards;
    }

    // Convert string hands to card arrays
    const fixedHands = {
        N: stringToCards(cards[Position.North]),
        E: stringToCards(cards[Position.East]),
        S: stringToCards(cards[Position.South]),
        W: stringToCards(cards[Position.West]),
    };

    // Generate a deal with the fixed hands
    const deal = generateCustom({
        fixed: fixedHands,
    });
    
    const hand = deal[0];
    const suitOrder = ['S', 'H', 'D', 'C'];

    function handToString(cards: CardLike[]): string {
        return suitOrder
            .map(suit =>
                cards
                    .filter(card => card.suit === suit)
                    .map(card => card.rank)
                    .join('')
            )
            .map(s => s === '' ? '-' : s)
            .join(' ');
    }

    return {
        [Position.North]: handToString(hand.N),
        [Position.East]: handToString(hand.E),
        [Position.South]: handToString(hand.S),
        [Position.West]: handToString(hand.W),
    };
}