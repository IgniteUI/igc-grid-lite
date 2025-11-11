import { html, LitElement, nothing } from 'lit';
import { property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { registerComponent } from '../internal/register.js';
import { GRID_ROW_TAG } from '../internal/tags.js';
import type { ActiveNode, ColumnConfiguration } from '../internal/types.js';
import { styles } from '../styles/body-row/body-row.css.js';
import ApexGridCell from './cell.js';

/**
 * Component representing the DOM row in the Apex grid.
 */
export default class ApexGridRow<T extends object> extends LitElement {
  public static get tagName() {
    return GRID_ROW_TAG;
  }
  public static override styles = styles;

  public static register(): void {
    registerComponent(ApexGridRow, ApexGridCell);
  }

  @queryAll(ApexGridCell.tagName)
  protected _cells!: NodeListOf<ApexGridCell<T>>;

  @property({ attribute: false })
  public data!: T;

  @property({ attribute: false })
  public columns: Array<ColumnConfiguration<T>> = [];

  public get cells() {
    return Array.from(this._cells);
  }

  @property({ attribute: false })
  public activeNode!: ActiveNode<T>;

  @property({ attribute: false, type: Number })
  public index = -1;

  public override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('exportparts', 'cell');
  }

  protected override render() {
    const { column: key, row: index } = this.activeNode;

    return html`
      ${map(this.columns, (column) =>
        column.hidden
          ? nothing
          : html`<igc-grid-lite-cell
              part="cell"
              .active=${key === column.key && index === this.index}
              .column=${column}
              .row=${this as ApexGridRow<T>}
              .value=${this.data[column.key]}
            ></igc-grid-lite-cell>`
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridRow.tagName]: ApexGridRow<object>;
  }
}
