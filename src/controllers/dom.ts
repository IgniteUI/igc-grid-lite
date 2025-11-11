import type { RenderItemFunction } from '@lit-labs/virtualizer/virtualize.js';
import { html, type ReactiveController } from 'lit';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { registerGridIcons } from '../internal/icon-registry.js';
import type { GridHost } from '../internal/types.js';
import { applyColumnWidths } from '../internal/utils.js';
import type { StateController } from './state.js';

export class GridDOMController<T extends object> implements ReactiveController {
  constructor(
    protected host: GridHost<T>,
    protected state: StateController<T>
  ) {
    this.host.addController(this);
  }

  #initialSize = () => {
    setTimeout(() => this.setScrollOffset());
  };

  public get container() {
    // @ts-expect-error: protected member access
    return this.host.scrollContainer;
  }

  public columnSizes: StyleInfo = {};

  public rowRenderer: RenderItemFunction<T> = (data: T, index: number) => {
    return html`
      <igc-grid-lite-row
        part="row"
        style=${styleMap({ ...this.columnSizes, ...this.getActiveRowStyles(index) })}
        .index=${index}
        .activeNode=${this.state.active}
        .data=${data}
        .columns=${this.host.columns}
      >
      </igc-grid-lite-row>
    `;
  };

  public async hostConnected() {
    registerGridIcons();
    this.setGridColumnSizes();
    // Wait for the initial paint of the virtualizer and recalculate the scrollbar offset
    // for the next one
    await this.host.updateComplete;
    this.container.addEventListener('visibilityChanged', this.#initialSize, { once: true });
  }

  public hostUpdate(): void {
    this.setScrollOffset();
    this.setGridColumnSizes();
  }

  public setScrollOffset() {
    const size = this.container ? this.container.offsetWidth - this.container.clientWidth : 0;
    this.host.style.setProperty('--scrollbar-offset', `${size}px`);
  }

  protected setGridColumnSizes() {
    this.columnSizes = applyColumnWidths(this.host.columns);
  }

  public getActiveRowStyles(index: number): StyleInfo {
    const { row } = this.state.active;
    return row === index ? { 'z-index': '3' } : {};
  }
}
