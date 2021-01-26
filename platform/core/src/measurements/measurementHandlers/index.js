import { MeasurementApi } from '../classes';
import handleSingleMeasurementAdded from './handleSingleMeasurementAdded';
import handleChildMeasurementAdded from './handleChildMeasurementAdded';
import handleSingleMeasurementModified from './handleSingleMeasurementModified';
import handleChildMeasurementModified from './handleChildMeasurementModified';
import handleSingleMeasurementRemoved from './handleSingleMeasurementRemoved';
import handleChildMeasurementRemoved from './handleChildMeasurementRemoved';
import refreshCornerstoneViewports from '../lib/refreshCornerstoneViewports';

let undoEventData = []
let redoEventData = []
let lastUndo;
let beforeUndo = false;
let isDeleted = false;

const getEventData = event => {
  const eventData = event.detail;
  if (eventData.toolName) {
    eventData.toolType = eventData.toolName;
  }

  return eventData;
};

const cloneObj = obj => {
  if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
    return obj;
  if (obj instanceof HTMLDivElement)
    return obj;
  else if (obj instanceof Date)
    var temp = new obj.constructor(); //or new Date(obj);
  else
    var temp = obj.constructor();

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj['isActiveClone'] = null;
      temp[key] = cloneObj(obj[key]);
      delete obj['isActiveClone'];
    }
  }
  return temp;
}
const MeasurementHandlers = {
  handleSingleMeasurementAdded,
  handleChildMeasurementAdded,
  handleSingleMeasurementModified,
  handleChildMeasurementModified,
  handleSingleMeasurementRemoved,
  handleChildMeasurementRemoved,

  onAdded(event) {
    const eventData = getEventData(event);
    undoEventData.push(cloneObj(eventData));
    const { toolType } = eventData;
    const {
      toolGroupId,
      toolGroup,
      tool,
    } = MeasurementApi.getToolConfiguration(toolType);
    const params = {
      eventData,
      tool,
      toolGroupId,
      toolGroup,
    };

    if (!tool) return;

    if (tool.parentTool) {
      handleChildMeasurementAdded(params);
    } else {
      handleSingleMeasurementAdded(params);
    }
  },

  onModified(event) {
    const eventData = getEventData(event);
    undoEventData.push(cloneObj(eventData));
    beforeUndo = false;
    isDeleted = false;
    const { toolType } = eventData;
    const {
      toolGroupId,
      toolGroup,
      tool,
    } = MeasurementApi.getToolConfiguration(toolType);
    const params = {
      eventData,
      tool,
      toolGroupId,
      toolGroup,
    };

    if (!tool) return;

    if (tool.parentTool) {
      handleChildMeasurementModified(params);
    } else {
      handleSingleMeasurementModified(params);
    }
  },

  onRemoved(event) {
    const eventData = getEventData(event);
    const { toolType } = eventData;
    const {
      toolGroupId,
      toolGroup,
      tool,
    } = MeasurementApi.getToolConfiguration(toolType);
    const params = {
      eventData,
      tool,
      toolGroupId,
      toolGroup,
    };

    if (!tool) return;

    if (tool.parentTool) {
      handleChildMeasurementRemoved(params);
    } else {
      handleSingleMeasurementRemoved(params);
    }
  },

  onDeletedUndo(eventData) {
    const { toolType } = eventData;
    const {
      toolGroupId,
      toolGroup,
      tool,
    } = MeasurementApi.getToolConfiguration(toolType);
    const params = {
      eventData,
      tool,
      toolGroupId,
      toolGroup,
    };

    if (!tool) return;

    if (tool.parentTool) {
      handleChildMeasurementRemoved(params);
    } else {
      handleSingleMeasurementRemoved(params);
    }
  },

  onUndo() {
    let undo2times = false;
    if (!beforeUndo) {
      redoEventData.push(cloneObj(undoEventData.pop()));
      beforeUndo = true;
      undo2times = true;
    }
    const eventData = undoEventData.pop();
    if (eventData === undefined)
      return;
    if (!undo2times)
      redoEventData.push(cloneObj(eventData));
    else
      undo2times = false;
    console.log(redoEventData);
    const { toolType, measurementData } = eventData;
    const measurementApi = MeasurementApi.Instance;
    if (!measurementData.hasOwnProperty('_id')) {
      console.log(lastUndo);
      this.onDeletedUndo(lastUndo);
      measurementApi.syncMeasurementsAndToolData();
      refreshCornerstoneViewports();
      isDeleted = true;
      return;
    }
    lastUndo = cloneObj(eventData);
    measurementApi.tools[toolType].forEach(function (item, index) {
      if (item._id === measurementData._id) {

        console.log(measurementData);
        Object.assign(measurementApi.tools[toolType][index], measurementData);
        console.log(measurementApi.tools[toolType][index]);
      }
    });
    measurementApi.syncMeasurementsAndToolData();
    refreshCornerstoneViewports();
  },
  onRedo() {
    const eventData = redoEventData.pop();
    undoEventData.push(cloneObj(eventData));
    if (eventData === undefined)
      return;
    const { toolType, measurementData } = eventData;
    const measurementApi = MeasurementApi.Instance;
    if (isDeleted) {
      this.onAddedRedo(eventData);
      measurementApi.syncMeasurementsAndToolData();
      refreshCornerstoneViewports();
      isDeleted = false;
      return;
    }
    measurementApi.tools[toolType].forEach(function (item, index) {
      if (item._id === measurementData._id) {

        console.log(measurementData);
        Object.assign(measurementApi.tools[toolType][index], measurementData);
        console.log(measurementApi.tools[toolType][index]);
      }
    });
    measurementApi.syncMeasurementsAndToolData();
    refreshCornerstoneViewports();
  },
  onAddedRedo(eventData) {
    const { toolType } = eventData;
    const {
      toolGroupId,
      toolGroup,
      tool,
    } = MeasurementApi.getToolConfiguration(toolType);
    const params = {
      eventData,
      tool,
      toolGroupId,
      toolGroup,
    };

    if (!tool) return;

    if (tool.parentTool) {
      handleChildMeasurementAdded(params);
    } else {
      handleSingleMeasurementAdded(params);
    }
  }
};

export default MeasurementHandlers;
