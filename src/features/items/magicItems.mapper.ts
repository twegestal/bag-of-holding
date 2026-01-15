import type { ItemCard } from '../../types/items';

export function mapItemCardToInsert(card: ItemCard) {
  return {
    name: card.name,
    type: card.type ?? '',
    slot: card.slot ?? '',
    value: card.value ?? '',
    attunement_required: card.attunement?.required ?? false,
    attunement_note: card.attunement?.note ?? '',
    has_art: card.image?.hasArt ?? false,
    confidence_overall: card.confidence?.overall ?? 0,
    confidence_warnings: card.confidence?.warnings ?? [],
    sections: card.sections ?? [],
  };
}
