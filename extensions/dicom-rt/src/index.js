import React from 'react';
import { utils } from '@ohif/core';
const { studyMetadataManager } = utils;

import init from './init.js';
import sopClassHandlerModule from './OHIFDicomRTStructSopClassHandler';
import id from './id.js';
import RTPanel from './components/RTPanel/RTPanel';
import { version } from '../package.json';

export default {
  /**
   * Only required property. Should be a unique value across all extensions.
   */
  id,
  version,

  /**
   *
   *
   * @param {object} [configuration={}]
   * @param {object|array} [configuration.csToolsConfig] - Passed directly to `initCornerstoneTools`
   */
  preRegistration({ servicesManager, configuration = {} }) {
    init({ servicesManager, configuration });
  },
  getPanelModule({ commandsManager, servicesManager, api }) {
    const ExtendedRTPanel = props => {
      const { activeContexts } = api.hooks.useAppContext();

      const contourItemClickHandler = contourData => {
        commandsManager.runCommand('jumpToImage', contourData);
      };

      return (
        <RTPanel
          {...props}
          onContourItemClick={contourItemClickHandler}
          activeContexts={activeContexts}
          contexts={api.contexts}
        />
      );
    };

    return {
      menuOptions: [
        {
          icon: 'list',
          label: 'RTSTRUCT',
          target: 'rt-panel',
          isDisabled: (studies, viewportData) => {
            if (!studies) {
              return true;
            }

            if (viewportData) {
              const { StudyInstanceUID, SeriesInstanceUID } = viewportData;
              const studyMetadata = studyMetadataManager.get(StudyInstanceUID);
              const derivedDisplaySets = studyMetadata.getDerivedDatasets({
                referencedSeriesInstanceUID: SeriesInstanceUID,
              });
              return !(['RTSTRUCT', 'CT'].includes(viewportData.Modality) && derivedDisplaySets.length);
            }

            for (let i = 0; i < studies.length; i++) {
              const study = studies[i];

              if (study && study.series) {
                for (let j = 0; j < study.series.length; j++) {
                  const series = study.series[j];

                  /* Could be expanded to contain RTPLAN and RTDOSE information in the future */
                  if (['RTSTRUCT'].includes(series.Modality)) {
                    return false;
                  }
                }
              }
            }

            return true;
          },
        },
      ],
      components: [
        {
          id: 'rt-panel',
          component: ExtendedRTPanel,
        },
      ],
      defaultContext: ['VIEWER'],
    };
  },
  getSopClassHandlerModule({ servicesManager }) {
    return sopClassHandlerModule;
  },
};
