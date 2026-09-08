import { handlebarsHelpers } from '../helpers/handlebars-helpers.mjs';

describe('Handlebars helpers', () => {
  describe('formatDate', () => {
    it('formate une date avec le format par défaut', () => {
      const result = handlebarsHelpers.formatDate('2026-09-08T10:30:00.000Z', undefined);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    });

    it('accepte un format personnalisé', () => {
      const result = handlebarsHelpers.formatDate('2026-09-08T10:30:00.000Z', 'YYYY');
      expect(result).toBe('2026');
    });
  });

  describe('eq', () => {
    it('retourne true pour des valeurs strictement égales', () => {
      expect(handlebarsHelpers.eq(1, 1)).toBe(true);
      expect(handlebarsHelpers.eq('a', 'a')).toBe(true);
    });

    it('retourne false pour des valeurs différentes', () => {
      expect(handlebarsHelpers.eq(1, '1')).toBe(false);
      expect(handlebarsHelpers.eq(1, 2)).toBe(false);
    });
  });

  describe('gt', () => {
    it('compare deux nombres', () => {
      expect(handlebarsHelpers.gt(5, 3)).toBe(true);
      expect(handlebarsHelpers.gt(2, 3)).toBe(false);
    });

    it('convertit les chaînes numériques', () => {
      expect(handlebarsHelpers.gt('10', '2')).toBe(true);
    });
  });

  describe('sum', () => {
    it('additionne deux nombres', () => {
      expect(handlebarsHelpers.sum(2, 3)).toBe(5);
    });

    it('convertit les chaînes numériques avant addition', () => {
      expect(handlebarsHelpers.sum('2', '3')).toBe(5);
    });
  });

  describe('json', () => {
    it('sérialise un objet en JSON', () => {
      expect(handlebarsHelpers.json({ a: 1 })).toBe('{"a":1}');
    });
  });

  describe('includes', () => {
    it('détecte la présence d\'une valeur dans un tableau', () => {
      expect(handlebarsHelpers.includes([1, 2, 3], 2)).toBe(true);
      expect(handlebarsHelpers.includes([1, 2, 3], 5)).toBe(false);
    });

    it('retourne false si ce n\'est pas un tableau', () => {
      expect(handlebarsHelpers.includes('abc', 'a')).toBe(false);
    });
  });

  describe('slice', () => {
    it('découpe une chaîne', () => {
      expect(handlebarsHelpers.slice('Bonjour', 0, 3)).toBe('Bon');
    });

    it('retourne une chaîne vide si ce n\'est pas une chaîne', () => {
      expect(handlebarsHelpers.slice(42, 0, 1)).toBe('');
    });
  });
});
