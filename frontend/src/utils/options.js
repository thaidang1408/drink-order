export const optionsKey = (options = []) =>
  options
    .map((o) => `${o.groupId}:${o.optionId}`)
    .sort()
    .join('|');

export const getDefaultSelections = (optionGroups = []) => {
  const selections = [];

  for (const group of optionGroups) {
    if (group.type === 'MULTIPLE' && !group.required) continue;

    const defaultOpt =
      group.options.find((o) => o.isDefault) ||
      (group.required ? group.options[0] : null);

    if (defaultOpt) {
      selections.push({ groupId: group.id, optionId: defaultOpt.id });
    }
  }

  return selections;
};

export const computeUnitPrice = (basePrice, optionGroups, selections) => {
  const selectedIds = new Set(selections.map((s) => s.optionId));
  let adjust = 0;

  for (const group of optionGroups) {
    for (const opt of group.options) {
      if (selectedIds.has(opt.id)) adjust += opt.priceAdjust;
    }
  }

  return basePrice + adjust;
};

export const buildOptionsLabel = (optionGroups, selections) =>
  selections
    .map((s) => {
      const group = optionGroups.find((g) => g.id === s.groupId);
      const opt = group?.options.find((o) => o.id === s.optionId);
      return opt?.name;
    })
    .filter(Boolean)
    .join(' · ');
