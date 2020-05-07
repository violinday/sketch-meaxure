import { state } from "../common";
import { getIndex, mouseoutLayer, selectedLayer, removeSelected, getEventTarget } from "./helper";
import { inspector } from "../render/inspector";
import { distance, hideDistance } from "./distance";
import { mouseoverLayer } from "./mouseoverLayer";
import { SMRect } from "../../src/meaxure/interfaces";

export function layerEvents() {
    document.body.addEventListener('click', function (event) {
        let target = event.target as HTMLElement;
        if (getEventTarget(document.body, event, 'header, #inspector, .navbar')) {
            event.stopPropagation();
            return;
        }
        if (document.querySelector('.screen-viewer').classList.contains('moving-screen')) {
            return;
        }
        if (target.classList.contains('layer') || target.classList.contains('slice-layer')) {
            var selected = (!target.classList.contains('slice-layer')) ?
                target :
                document.querySelector('.layer-' + target.attributes['data-objectid']) as HTMLElement;
            state.selectedIndex = getIndex(selected);
            hideDistance();
            mouseoutLayer();
            selectedLayer();
            inspector();
            return;
        }
        removeSelected();
        hideDistance();
        document.querySelector('#inspector').classList.remove('active');
        state.selectedIndex = undefined;
        state.tempTargetRect = undefined;
    });
    document.body.addEventListener('mousemove', function (event) {
        if (document.querySelector('.screen-viewer').classList.contains('moving-screen'))
            return;
        mouseoutLayer();
        hideDistance();
        let target = event.target as HTMLElement;
        if (target.classList.contains('screen-viewer') || target.classList.contains('screen-viewer-inner')) {
            state.tempTargetRect = getEdgeRect(event);
            state.targetIndex = undefined;
            distance();
        } else if (target.classList.contains('layer')) {
            state.targetIndex = getIndex(event.target as HTMLElement);
            state.tempTargetRect = undefined;
            mouseoverLayer();
            distance();
        } else {
            state.tempTargetRect = undefined;
        }
    });
}

function getEdgeRect(event: MouseEvent): SMRect {
    let screen = document.querySelector('#screen') as HTMLElement;
    let rect = screen.getBoundingClientRect();
    let x = (event.pageX - rect.left) / state.zoom;
    let y = (event.pageY - rect.top) / state.zoom;
    let width = 10;
    let height = 10;
    let xScope = (x >= 0 && x <= state.current.width);
    let yScope = (y >= 0 && y <= state.current.height);
    // left and top
    if (x <= 0 && y <= 0) {
        x = -10;
        y = -10;
    }
    // right and top
    else if (x >= state.current.width && y <= 0) {
        x = state.current.width;
        y = -10;
    }
    // right and bottom
    else if (x >= state.current.width && y >= state.current.height) {
        x = state.current.width;
        y = state.current.height;
    }
    // left and bottom
    else if (x <= 0 && y >= state.current.height) {
        x = -10;
        y = state.current.height;
    }
    // top
    else if (y <= 0 && xScope) {
        x = 0;
        y = -10;
        width = state.current.width;
    }
    // right
    else if (x >= state.current.width && yScope) {
        x = state.current.width;
        y = 0;
        height = state.current.height;
    }
    // bottom
    else if (y >= state.current.height && xScope) {
        x = 0;
        y = state.current.height;
        width = state.current.width;
    }
    // left
    else if (x <= 0 && yScope) {
        x = -10;
        y = 0;
        height = state.current.height;
    }
    if (xScope && yScope) {
        x = 0;
        y = 0;
        width = state.current.width;
        height = state.current.height;
    }
    return {
        x: x,
        y: y,
        width: width,
        height: height,
    }
}