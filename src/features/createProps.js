export const createProps = (layout) => {
  var bct = layout.BCT;
  var allProps = {
    // Sorting
    sorting:
      bct.sorting && bct.sorting != null && bct.sorting != ""
        ? bct.sorting
        : "asc",
    // Legend
    legend:
      bct.legendSwitch && bct.legendSwitch != null && bct.legendSwitch
        ? bct.legendSwitch
        : false,
    // Tooltip
    tooltipTitle: bct.tooltiptitle != "" ? bct.tooltiptitle : "",
  };
  return allProps;
};
