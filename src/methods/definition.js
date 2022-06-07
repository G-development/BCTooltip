import { cpAbout, cpString, cpTextArea, cpButtonGroup, cpSwitch} from "./util";

var sortingOptions = [{
	value: "asc",
	label: "A",
	tooltip: "Select for ascending order"
}, {
	value: "desc",
	label: "D",
	tooltip: "Select for descending order",
}, {
   value: "no",
   label: "None",
   tooltip: "Select for no order"
}];

export default {
  type: "items",
  component: "accordion",
  items: {
    dimensions: {
      uses: "dimensions",
      min: 1,
      max: 2,
    },
    measures: {
      uses: "measures",
      min: 1,
      max: 3,
      items: {
        color: cpString("qAttributeExpressions.0.qExpression", "Stack color", "", "optional", "string", "expression"),
        moreInfo: cpString("qAttributeExpressions.1.qExpression", "More info", "", "optional", "string", "expression")
      }
    },
    settings: {
      uses: "settings",
    },
    config: {
      type: "items",
      label: "Configuration",
      items: {
        sorting: cpButtonGroup("BCT.sorting", "Sorting", "Ascending", sortingOptions),

        // Configuration
        allSettings: {
					uses: "addons",
					items: {
						// Legend
						legendSettings: {
							type: "items",
							label: "Legend settings",
							items: {
								legendSwitch: cpSwitch("BCT.legendSwitch", "Show legend", "Yes", "No", false),
							}
						},
            // Tooltip 
            tooltipSettings: {
              type: "items",
							label: "Tooltip settings",
							items: {
                tooltipTitle: cpString("BCT.tooltiptitle", "Tooltip title", "", "otional", "expression", "expression"),
                cssTextArea: cpTextArea("BCT.cssTextArea", "More CSS", "", 7, 1000),
							}
            }
          }
        }
      },
    },

    about: cpAbout("extension", "1.0.0"),
  },
};
