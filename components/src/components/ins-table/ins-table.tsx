import {
  h,
  Component,
  Prop,
  Event,
  EventEmitter,
  State,
  Listen,
  Element,
  Method,
  Watch,
} from "@stencil/core";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

@Component({ tag: "ins-table" })
export class InsTable {
  @Element() insTableEl: HTMLElement;

  @Event() insPaginationChange: EventEmitter;
  @Event() insTableSearch: EventEmitter;
  @Event() insTableSort: EventEmitter;
  @Event() insTableBulkAction: EventEmitter;
  @Event() insTableRowAction: EventEmitter;
  @Event() insFieldChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({ mutable: true }) noWrap: boolean = false;
  @Prop({ mutable: true }) searchPosition: string = "right";
  @Prop({ mutable: true }) withoutSearch: boolean = false;
  @Prop({ mutable: true }) withoutPagination: boolean = false;
  @Prop({ mutable: true }) staticTable: boolean = false;
  @Prop({ mutable: true }) loadingScreen: boolean = false;
  @Prop({ mutable: true }) loaderTitle: any;
  @Prop({ mutable: true }) loaderMessage: any;
  @Prop({ mutable: true }) loaderIcon: any;
  @Prop({ mutable: true }) loaderImageSource: string = null;
  @Prop({ mutable: true }) searchbarPlaceholder: string = "";
  @Prop({ mutable: true }) heading: string = "";
  @Prop({ mutable: true }) currency: string = "";
  @Prop({ mutable: true }) tableHeaders: any = [];
  @Prop({ mutable: true }) tableData: any = [];
  @Prop({ mutable: true }) pageNumber: number = 1;
  @Prop({ mutable: true }) pageSize: number = 10;
  @Prop({ mutable: true }) pageSizeOptions: any = [10, 20, 50];
  @Prop({ mutable: true }) totalCount: any = 0;
  @Prop({ mutable: true }) isTotalCountEstimated: boolean = false;
  @Prop({ mutable: true }) totalCountLoading: boolean = false;
  @Prop({ mutable: true }) totalCountLoadingFailed: boolean = false;
  @Prop({ mutable: true }) bulkActions: any = [];
  @Prop({ mutable: true }) rowActions: any = [];
  @Prop({ mutable: true }) rowActionsSettings: any;
  @Prop({ mutable: true }) selectedRows: any = [];
  @Prop({ mutable: true }) updatedRows: any = [];
  @Prop({ mutable: true }) emptyValue: string = "-";
  @Prop({ mutable: true }) sortOrder: boolean = false;
  @Prop({ mutable: true }) sortKeyword: string = "";
  @Prop({ mutable: true }) textOverflow: string = "";
  @Prop({ mutable: true }) defaultBulkAction: string = "";
  @Prop({ mutable: true }) paginationText: string = "Rows per page:";
  @Prop({ mutable: true }) initialSearch: string = "";
  @Prop({ mutable: true }) timezoneIcon: string = "icon-clock";

  @State() pageInfo: string = "0-0 of 0";
  @State() nextDisabled: boolean = false;
  @State() tableUpdated: boolean = false;

  @State() hasImage: boolean = false;
  @State() hasRowActions: boolean = false;

  @State() tableDataCopy: any = [];

  selectedBulkAction: string = "";

  @Watch("tableData")
  tableDataChangeHandler() {
    this.tableUpdated = true;
  }

  @Watch("bulkActions")
  bulkActionsChangeHandler() {
    let bulkActionEl = this.insTableEl.querySelector(
      'ins-select[data-type="bulk-action"]'
    ) as any;
    if (bulkActionEl) {
      bulkActionEl.reset();
      this.resetSelections();
    }
  }

  componentWillLoad() {
    this.updatePageInfo();
  }

  componentDidUpdate() {
    this.updateBulkActionEl();
  }

  async updateBulkActionEl() {
    let bulkActionEl = this.insTableEl.querySelector(
      'ins-select[data-type="bulk-action"]'
    ) as any;
    if (bulkActionEl)
      await bulkActionEl.setSelectedFromValue(this.selectedBulkAction);
  }

  componentDidLoad() {
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]) {
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insTableEl);
    }

    if (this.defaultBulkAction) {
      this.selectedBulkAction = this.defaultBulkAction;
      this.updateBulkActionEl();
    }
  }

  componentWillUpdate() {
    if (this.tableUpdated) {
      let tdCheckboxes = this.insTableEl.querySelectorAll(
        "ins-checkbox"
      ) as any;
      let insCheckboxAll = this.insTableEl.querySelector("#checkAll") as any;
      let insCheckboxAllAccordion = this.insTableEl.querySelector(
        "#checkAllAccordion"
      ) as any;

      let counter = 0;
      this.uncheckAll();

      for (let i = 0; i < tdCheckboxes.length; i++) {
        let selectionIndex = this.selectedRows.findIndex((selected) => {
          return tdCheckboxes[i].value.id === selected.id;
        });

        if (selectionIndex >= 0) {
          tdCheckboxes[i].updateCheckState(true);
          counter++;
        }
      }
      if (counter === tdCheckboxes.length - 2) {
        insCheckboxAll.updateCheckState(true);
        insCheckboxAllAccordion.updateCheckState(true);
      }
      this.hasImage = false;
      this.tableHeaders.forEach((header) => {
        if (header.hasImage) {
          this.hasImage = true;
        }
      });
      this.tableUpdated = false;
    }
    this.updatePageInfo();
  }

  numberWithCommas(x: number | string) {
    let formatted = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (this.isTotalCountEstimated) {
      formatted = `~${formatted}`;
    }
    return formatted;
  }

  @Listen("insInput")
  onSearchHandler(event: any) {
    if (event.target.icon === "icon-search") {
      this.insTableSearch.emit(event.detail);
    }
  }

  @Listen("insClick")
  onClickInsButtonHandler(event: any) {
    if (event.target.className.includes("insTableBulkButton")) {
      this.bulkActionHandler();
    }
  }

  @Listen("insCheck")
  onCheckInsCheckbox(event: any) {
    let self = this;
    if (event.detail.value === "checkAll") {
      let tdCheckboxes = this.insTableEl.querySelectorAll(
        "ins-checkbox"
      ) as any;
      if (event.detail.checked) {
        for (let i = 0; i < tdCheckboxes.length; i++) {
          if (tdCheckboxes[i].value !== "checkAll") {
            tdCheckboxes[i].updateCheckState(event.detail.checked);

            if (event.detail.checked) {
              let selectionIndex = self.selectedRows.findIndex((item) => {
                return item.id === tdCheckboxes[i].value.id;
              });

              if (selectionIndex === -1) {
                self.selectedRows.push(tdCheckboxes[i].value);
              }
            }

            this.enterEditMode(
              tdCheckboxes[i],
              event.detail.checked,
              tdCheckboxes[i].value
            );
          }
        }
      } else {
        for (let i = 0; i < tdCheckboxes.length; i++) {
          if (tdCheckboxes[i].value !== "checkAll") {
            tdCheckboxes[i].updateCheckState(event.detail.checked);
            if (!event.detail.checked) {
              let selectionIndex = self.selectedRows.findIndex((item) => {
                return item.id === tdCheckboxes[i].value.id;
              });

              if (selectionIndex >= 0) {
                self.selectedRows.splice(selectionIndex, 1);
              }
            }
            this.enterEditMode(
              tdCheckboxes[i],
              event.detail.checked,
              tdCheckboxes[i].value
            );
          }
        }
      }
      this.selectedRows = this.selectedRows.slice();
    } else {
      let checkAllEl = this.insTableEl.querySelector("#checkAll") as any;
      checkAllEl.updateCheckState(false);
      this.updateSelectedRows(event.detail.value);
      this.enterEditMode(
        event.target,
        event.detail.checked,
        event.detail.value
      );
    }
  }

  enterEditMode(el: HTMLElement, checked: boolean, item: any) {
    let trEl = el.closest(".ibt-table_tr");
    let trAccEl = el.closest(".ibt-table-accordion_row-td");

    if (trEl || trAccEl) {
      let elToUse = trEl ? trEl : trAccEl;
      let hasEditable = elToUse.querySelector(".editable");

      if (hasEditable) {
        checked
          ? elToUse.classList.add("edit-mode")
          : elToUse.classList.remove("edit-mode");

        item.__editing_ins_base_table_item = checked;
      }

      if (!checked) {
        this.removeUpdatedRow(item);
      }
    }
  }

  uncheckAll() {
    let tdCheckboxes = this.insTableEl.querySelectorAll("ins-checkbox") as any;
    for (let i = 0; i < tdCheckboxes.length; i++) {
      tdCheckboxes[i].updateCheckState(false);
    }
  }

  updateSelectedRows(value: any) {
    let selectionIndex = this.selectedRows.findIndex((item) => {
      return item.id === value.id;
    });

    if (selectionIndex === -1) {
      let copy = JSON.parse(JSON.stringify(value));
      delete copy.__editing_ins_base_table_item;
      this.selectedRows.push(copy);
    } else {
      this.selectedRows.splice(selectionIndex, 1);
    }

    this.selectedRows = [...this.selectedRows];
  }

  updateUpdatedRows(value: any, prop: string) {
    let selectionIndex = this.updatedRows.findIndex((item) => {
      return item.id === value.id;
    });

    if (selectionIndex >= 0) {
      this.updatedRows[selectionIndex][prop] = value[prop];
    } else {
      this.updatedRows.push(value);
    }
  }

  removeUpdatedRow(value: any) {
    let selectionIndex = this.updatedRows.findIndex((item) => {
      return item.id === value.id;
    });

    if (selectionIndex >= 0) {
      this.updatedRows.splice(selectionIndex, 1);
    }
  }

  pageSizeChangeHandler(event: any) {
    this.pageNumber = 1;
    this.pageSize = parseInt(event.target.value);

    this.insPaginationChange.emit({
      pageSize: this.pageSize,
      pageNumber: this.pageNumber,
    });
  }

  pageNumberChangeHandler(key?) {
    if (key === "prev") {
      this.pageNumber--;
    } else if (key === "next") {
      this.pageNumber++;
    } else if (key === "first") {
      this.pageNumber = 1;
    } else if (key === "last") {
      this.pageNumber = Math.ceil(this.totalCount / this.pageSize);
    } else {
      this.pageNumber = key;
    }

    this.insPaginationChange.emit({
      pageSize: this.pageSize,
      pageNumber: this.pageNumber,
    });
  }

  @Method()
  async updatePageInfo() {
    let from = this.pageSize * this.pageNumber - (this.pageSize - 1);
    let to = this.pageSize * this.pageNumber;
    to = to > this.totalCount ? this.totalCount : to;

    if (!this.staticTable && !this.tableData.length) from = 0;

    let totalCountDisplay;
    if (this.totalCountLoading) {
      totalCountDisplay = "loading...";
    } else if (this.totalCountLoadingFailed) {
      totalCountDisplay = "loading failed";
    } else {
      totalCountDisplay = this.numberWithCommas(this.totalCount);
    }

    this.pageInfo = from + "-" + to + " of " + totalCountDisplay;
  }

  sortTable(column: string) {
    if (this.sortKeyword === column) {
      this.sortOrder = !this.sortOrder;
    } else {
      this.sortOrder = true;
    }

    this.sortKeyword = column;

    this.insTableSort.emit({
      keyword: this.sortKeyword,
      order: this.sortOrder ? "asc" : "desc",
    });
  }

  bulkActionHandler() {
    if (this.selectedBulkAction) {
      this.insTableBulkAction.emit({
        action: this.selectedBulkAction,
        selections: this.selectedRows,
        updated_items: this.updatedRows,
      });
    }
  }

  rowActionHandler(action: string, data: any, header: string) {
    this.insTableRowAction.emit({ action, header, data });
  }

  @Method()
  async resetSelections() {
    this.selectedRows = [];
    let tdCheckboxes = this.insTableEl.querySelectorAll("ins-checkbox") as any;
    for (let i = 0; i < tdCheckboxes.length; i++) {
      tdCheckboxes[i].updateCheckState(false);
    }
  }
  @Method()
  async setBulkAction(value: string) {
    let bulkActionEl = this.insTableEl.querySelector(
      'ins-select[data-type="bulk-action"]'
    ) as any;
    bulkActionEl.setSelectedFromValue(value);
  }

  toggleSelectOptionsWrap(event: any) {
    let section;
    let parent = event.target.parentNode;
    let classes = parent.className;

    if (classes.includes("ibt-table-accordion_row-head")) {
      section = parent.nextSibling;
    } else if (classes.includes("ibt-table-accordion_row-td")) {
      section = parent.querySelector(".ibt-table-accordion_row-body");
    } else if (classes.includes("first-td")) {
      section = parent.parentNode.nextSibling;
    } else if (classes.includes("img-wrap")) {
      section = parent.parentNode.parentNode.nextSibling;
    } else if (classes.includes("text-label")) {
      section = parent.parentNode.parentNode.nextSibling;
    }

    if (section) {
      let opened = section.getAttribute("data-opened");

      if (opened === "false") {
        this.openBody(section);
      } else {
        this.closeBody(section);
      }
    }
  }

  closeBody(element: HTMLElement) {
    let sectionHeight = element.scrollHeight > 400 ? 400 : element.scrollHeight;
    let elementTransition = element.style.transition;
    element.style.transition = "";
    requestAnimationFrame(function () {
      element.style.height = sectionHeight + "px";
      element.style.transition = elementTransition;

      requestAnimationFrame(function () {
        element.style.height = 0 + "px";
      });
    });
    element.classList.remove("opened");
    element.setAttribute("data-opened", "false");
    (element.parentNode as HTMLElement).classList.remove("activated");
  }

  openBody(element: HTMLElement) {
    let sectionHeight = element.scrollHeight + 26;
    if (element.getAttribute("data-opened") != "true") {
      element.style.height = sectionHeight + "px";
    }
    element.classList.add("opened");
    element.setAttribute("data-opened", "true");
    (element.parentNode as HTMLElement).classList.add("activated");
  }

  getInitials(value: string) {
    if (value) {
      let split = value.split(" ");

      if (split.length > 1) {
        return `${split[0][0]}${split[1][0]}`;
      } else if (split.length === 1) {
        return `${split[0][0]}${split[0][1]}`;
      } else {
        return this.emptyValue;
      }
    } else {
      return this.emptyValue;
    }
  }

  canHaveRowActions(index: number, tableHeader: any /*, item */) {
    if (
      index === 0 ||
      tableHeader.hasColumnAction
    ) {
      return true;
    } else {
      return false;
    }
  }

  @Listen("insValueChange")
  @Listen("insInput")
  processEvent(event: any) {
    if (event.target.id) {
      if (event.target.attributes["data-id"]) {
        let dataId = event.target.attributes["data-id"].value;
        let item = this.tableData.find((item) => item.id === dataId);
        let copy = JSON.parse(JSON.stringify(item));
        let prop = event.target.getAttribute("data-property");

        copy[prop] = event.detail.value || event.detail;

        delete copy.__editing_ins_base_table_item;
        event.table_detail = { label: prop, rowData: copy };
        this.insFieldChange.emit(event);
        this.updateUpdatedRows(copy, prop);
      }
    } else if (
      event.target.attributes["data-type"] &&
      event.target.attributes["data-type"].value === "bulk-action"
    ) {
      this.selectedBulkAction = event.detail.value || event.detail;
    }
  }

  checkEditedItems(item: any) {
    let res = this.updatedRows.find((editedItem) => item.id === editedItem.id);
    return res ? res : item;
  }

  renderField(item: any, tableHeader: any) {
    let editedItem = this.checkEditedItems(item);

    switch (tableHeader.type) {
      case "date":
        return (
          <div class="input-wrap">
            <ins-date-time
              id={`${editedItem.id}_${tableHeader.label.split(" ").join("_")}`}
              data-id={editedItem.id}
              data-property={tableHeader.label}
              value={editedItem[tableHeader.label]}
              icon="icon-today"
              format={tableHeader.dateFormat}
              mode="datepicker"
            ></ins-date-time>
          </div>
        );

      case "select":
        return (
          <div class="input-wrap">
            <ins-select
              id={`${editedItem.id}_${tableHeader.label.split(" ").join("_")}`}
              data-id={editedItem.id}
              data-property={tableHeader.label}
              value={
                tableHeader.hasTag && tableHeader.multipleTags
                  ? typeof editedItem[tableHeader.label] === "object" &&
                    editedItem[tableHeader.label]?.length
                    ? editedItem[tableHeader.label]
                    : []
                  : editedItem[tableHeader.label]
              }
              multiple={tableHeader.hasTag && tableHeader.multipleTags}
            >
              {tableHeader.selectOptions && tableHeader.selectOptions.length ? (
                tableHeader.selectOptions.map((option) => (
                  <ins-select-option
                    value={option}
                    label={option}
                  ></ins-select-option>
                ))
              ) : (
                <ins-select-option
                  value=""
                  label="No options"
                  disabled
                ></ins-select-option>
              )}
            </ins-select>
          </div>
        );

      default:
        return (
          <div class="input-wrap">
            <ins-input
              id={`${editedItem.id}_${tableHeader.label.split(" ").join("_")}`}
              data-id={editedItem.id}
              data-property={tableHeader.label}
              value={editedItem[tableHeader.label]}
            ></ins-input>
          </div>
        );
    }
  }

  extractDate(dateString: string): string {
    const trimmedString = dateString.trim();
    const match = trimmedString.match(/\(([^)]+)\)/);
    return match ? match[1] : trimmedString;
  }

  getDeviceTimezone() {
    const date = new Date();
    const timezoneOffsetMinutes = date.getTimezoneOffset();

    const offsetHours = -timezoneOffsetMinutes / 60;
    const offsetMinutes = Math.abs(timezoneOffsetMinutes % 60);
    const offsetSign = offsetHours >= 0 ? "+" : "-";
    let formattedOffset = `UTC${offsetSign}${String(offsetHours).padStart(
      2,
      "0"
    )}:${String(offsetMinutes).padStart(2, "0")}`;

    if (offsetHours === 0 && offsetMinutes === 0) return `UTC / GMT`;

    return formattedOffset;
  }

  toUTC(date: string, format: string): string {
    const localDate = dayjs(date, format);
    const utcDate = localDate.utc();
    const utcString = utcDate.format(format);
    return utcString;
  }

  offsetDateTime(localDate: string, offset: string, format: string): string {
    const offsetParts = offset.split("@");
    const offsetHours = parseInt(offsetParts[0]) / 100;

    const localDateTime = dayjs(localDate, format);
    const offsetDateTime = localDateTime.utcOffset(offsetHours);

    return offsetDateTime.format(format);
  }

  setDefaultTime(timeValue: string, timeFormat: string) {
    if (timeValue) return timeValue;

    return dayjs('00:00:00', 'HH:mm:ss').format(timeFormat);
  }

  rowDataRenderer(item: any, tableHeader: any) {
    if ((tableHeader.type === "date" || tableHeader.type === "date_time" || tableHeader.type === "datetime")
      && (tableHeader.date_format || tableHeader.timezone_overlay)) {
      let timezoneOverlay = tableHeader.timezone_overlay || tableHeader.date_format;
      let dateValue = item[tableHeader.label];
      let dateTimeFormat = timezoneOverlay?.date_time_format;

      if (timezoneOverlay.date_format && timezoneOverlay.time_format) dateTimeFormat = `${timezoneOverlay.date_format} ${timezoneOverlay.time_format}`;
      if (tableHeader.type === "date" && timezoneOverlay.time_format) dateValue = `${dateValue} ${this.setDefaultTime(timezoneOverlay.time, timezoneOverlay.time_format)}`;

      const content = `<div class="overlay-tooltip">
        <div class="timezones">
          <p class="paragraph-medium main-text time-info">
            Device Time • ${
              timezoneOverlay?.device_time || this.getDeviceTimezone()
            }
          </p>
          <p class="paragraph-medium time">
            ${this.extractDate(dateValue)}
          </p>
        </div>
        <div class="timezones">
          <p class="paragraph-medium main-text time-info">
            Instance Time • ${timezoneOverlay?.instance_time}
          </p>
          <p class="paragraph-medium time">
            ${this.offsetDateTime(
              this.extractDate(dateValue),
              timezoneOverlay?.instance_timezone,
              dateTimeFormat
            )}
          </p>
        </div>
        <div class="timezones last">
          <p class="paragraph-medium main-text time-info">UTC</p>
          <p class="paragraph-medium time">
            ${this.toUTC(
              this.extractDate(dateValue),
              dateTimeFormat
            )}
          </p>
        </div>
      </div>`;

      return (
        <div class="timezone-overlay-container">
          <ins-input-tooltip
            label={item[tableHeader.label]}
            icon={this.timezoneIcon}
            content={content}
            trigger="mouseenter"
          ></ins-input-tooltip>
        </div>
      );
    }

    if (item[`${tableHeader.label}Link`]) {
      return (
        <a class={`ibt-link`} href={item[`${tableHeader.label}Link`]}>
          {tableHeader.type === "currency"
            ? `${this.currency ? this.currency : "$"}${item[tableHeader.label]}`
            : item[tableHeader.label]}
        </a>
      );
    }

    if (tableHeader.image) {
      return item[tableHeader.label] ? (
        <img
          class="ibt-image"
          alt={item[tableHeader.label]}
          src={item[tableHeader.label]}
        />
      ) : (
        ""
      );
    }

    return tableHeader.hasTag && tableHeader.multipleTags ? (
      item[tableHeader.label].length > 0 &&
      typeof item[tableHeader.label] === "object" ? (
        item[tableHeader.label].map((tag) => (
          <span class={`ibt-link ibt-tag ${tag}`}>{tag}</span>
        ))
      ) : (
        <span class="ibt-link">-</span>
      )
    ) : (
      <span
        class="ibt-link"
        onClick={() => {
          !this.rowActions.length
            ? this.rowActionHandler(
                "rowItemClick",
                item,
                item[tableHeader.label]
              )
            : "";
        }}
      >
        {tableHeader.type === "currency"
          ? `${this.currency ? this.currency : "$"}${item[tableHeader.label]}`
          : item[tableHeader.label]}
      </span>
    );
  }

  updateKebabCase(value: string): string {
    if (value)
      return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/\/+/g, "");
    return "";
  }

  rowActionMapper(rowAction: string, item: any, tableHeader: any) {
    let header = tableHeader ? tableHeader.label : "";

    if (this.rowActionsSettings) {
      if (
        this.rowActionsSettings.rowActions[
          item[this.rowActionsSettings.column]
        ]?.indexOf(rowAction) !== -1
      ) {
        if (item[`${rowAction}Link`]) {
          return (
            <a
              class={`action-item row-action-${this.updateKebabCase(rowAction)}
            ${
              rowAction === "Remove" ||
              rowAction === "Delete" ||
              rowAction === "Disable"
                ? "archive"
                : rowAction === "Restore" || rowAction === "Enable"
                ? "restore"
                : this.updateKebabCase(rowAction)
            }`}
              href={item[`${rowAction}Link`]}
            >
              {rowAction}
            </a>
          );
        }

        return (
          <span
            class={`action-item row-action-${this.updateKebabCase(rowAction)}
              ${
                rowAction === "Archive" ||
                rowAction === "Remove" ||
                rowAction === "Delete" ||
                rowAction === "Disable"
                  ? "archive"
                  : rowAction === "Restore" || rowAction === "Enable"
                  ? "restore"
                  : this.updateKebabCase(rowAction)
              }`}
            onClick={() => this.rowActionHandler(rowAction, item, header)}
          >
            {rowAction}
          </span>
        );
      }
    } else {
      if (item[`${rowAction}Link`]) {
        return (
          <a
            class={`action-item row-action-${this.updateKebabCase(rowAction)}
          ${
            rowAction === "Archive" ||
            rowAction === "Remove" ||
            rowAction === "Delete" ||
            rowAction === "Disable"
              ? "archive"
              : rowAction === "Restore" || rowAction === "Enable"
              ? "restore"
              : this.updateKebabCase(rowAction)
          }`}
            href={item[`${rowAction}Link`]}
          >
            {rowAction}
          </a>
        );
      }

      return (
        <span
          class={`action-item row-action-${this.updateKebabCase(rowAction)}
            ${
              rowAction === "Archive" ||
              rowAction === "Remove" ||
              rowAction === "Delete" ||
              rowAction === "Disable"
                ? "archive"
                : rowAction === "Restore" || rowAction === "Enable"
                ? "restore"
                : this.updateKebabCase(rowAction)
            }`}
          onClick={() => this.rowActionHandler(rowAction, item, header)}
        >
          {rowAction}
        </span>
      );
    }
  }

  renderMobileImage(item: any, headerLabel: string, mobileHeader: any, hasImage: boolean) {
    return hasImage && item[headerLabel] && !mobileHeader ? (
      <div class="img-wrap">
        {item[`${headerLabel}_Img`] ? (
          <img src={item[`${headerLabel}_Img`]} />
        ) : (
          <div class="img-fallback-wrap">
            {this.getInitials(item[headerLabel])}
          </div>
        )}
      </div>
    ) : (
      ""
    );
  }

  renderMobileHeader(item: any, headerLabel: string) {
    return (
      <div class="text-label">
        <span>{item[headerLabel] ? item[headerLabel] : "-"}</span>
      </div>
    );
  }

  renderMobileRowHeader(item) {
    let firstHeader = this.tableHeaders[0];
    let mobileHeader = this.tableHeaders.find(
      (item) => item.mobileHeader === true
    );
    let hasImage = firstHeader.hasImage;
    let headerLabel = mobileHeader ? mobileHeader.label : firstHeader.label;

    return (
      <div class={`first-td ${hasImage && !mobileHeader ? "has-image" : ""}`}>
        {this.renderMobileImage(item, headerLabel, mobileHeader, hasImage)}
        {this.renderMobileHeader(item, headerLabel)}
      </div>
    );
  }

  renderMainMobileHeader() {
    let header = this.tableHeaders.find((item) => item.mobileHeader === true);
    let mobileHeader = header ? header.label : this.tableHeaders[0].label;

    return (
      <div class="ibt-table-accordion_th has-checkbox">
        {this.bulkActions.length ? (
          <div class="checkbox-wrap">
            {this.loadingScreen ? (
              ""
            ) : (
              <ins-checkbox
                id="checkAllAccordion"
                value="checkAll"
              ></ins-checkbox>
            )}
          </div>
        ) : (
          ""
        )}

        <div class="first-th">
          <span
            onClick={() => this.sortTable(mobileHeader)}
            class={`label-wrap ${
              this.sortKeyword === mobileHeader ? "sorted" : ""
            }`}
          >
            {mobileHeader}

            {this.sortKeyword === mobileHeader ? (
              <span
                class={`icon-arrow-up ${this.sortOrder ? "" : "go-down"}`}
              ></span>
            ) : (
              ""
            )}
          </span>
        </div>
      </div>
    );
  }

  renderPageNumbers() {
    if (!this.totalCount) return [];
    if (this.totalCount < this.pageSize) return [1];

    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    const pages = [];

    let pageNumber = this.pageNumber;
    let length = 5;

    if (totalPages < 5) {
      length = totalPages;
    } else if (pageNumber + 4 > totalPages) {
      pageNumber = totalPages - 4;
    }

    for (let i = 0; i < length; i++) {
      const page = pageNumber + i;
      if (page <= totalPages) pages.push(page);
    }

    return pages;
  }

  render() {
    return (
      <div
        class={`ibt-table-wrap ibt-table-wrap__stripe ${
          this.heading ? "" : "no-label"
        } ${this.noWrap ? "no-wrap" : ""}`}
      >
        {this.heading || !this.withoutSearch ? (
          <div class="ibt-table-header-wrap">
            {this.heading ? (
              <div class="ibt-table-wrap__title">{this.heading}</div>
            ) : (
              ""
            )}

            {this.withoutSearch ? (
              ""
            ) : (
              <div
                class={`ins-searchbar-container ${
                  this.searchPosition === "left" ? "left" : ""
                }`}
              >
                <ins-input
                  placeholder={this.searchbarPlaceholder}
                  value={this.initialSearch}
                  icon="icon-search"
                ></ins-input>
              </div>
            )}
          </div>
        ) : (
          ""
        )}
        <div
          class={`ibt-table-wrap__no-heading ${this.noWrap ? "no-wrap" : ""}`}
        >
          {this.staticTable ? (
            <div class="static-wrap">
              <div class={`ibt-table ${this.staticTable ? "static" : ""}`}>
                <slot />
              </div>
              {this.loadingScreen ? (
                <div class={`loading-screen`}>
                  <ins-loader
                    image-source={this.loaderImageSource}
                    state-title={this.loaderTitle}
                    state-message={this.loaderMessage}
                    state-icon={this.loaderIcon}
                  ></ins-loader>
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            <div class="dynamic-wrap">
              <div class="ibt-table">
                {this.tableHeaders.length ? (
                  <div class="ibt-table_tr">
                    {this.bulkActions.length ? (
                      <div class="ibt-table_th checkbox">
                        {this.loadingScreen ? (
                          ""
                        ) : (
                          <ins-checkbox
                            id="checkAll"
                            value="checkAll"
                          ></ins-checkbox>
                        )}
                      </div>
                    ) : (
                      ""
                    )}

                    {this.tableHeaders.map((tableHeader) => {
                      return (
                        <div
                          class={`ibt-table_th
                      ${
                        tableHeader.type === "number" ||
                        tableHeader.type === "currency"
                          ? "text-right"
                          : ""
                      }
                      ${tableHeader.sortable ? "" : "not-sortable"}
                      ${
                        tableHeader.textAlign
                          ? `text-${tableHeader.textAlign}`
                          : ""
                      }`}
                          style={{ width: tableHeader.columnWidth || "auto" }}
                        >
                          <span
                            onClick={() => {
                              if (tableHeader.sortable) {
                                this.sortTable(tableHeader.label);
                              }
                            }}
                            class={`label-wrap
                            ${
                              this.sortKeyword === tableHeader.label
                                ? "sorted"
                                : ""
                            }
                            ${tableHeader.sortable ? "sortable" : ""}`}
                          >
                            {tableHeader.label}
                            {tableHeader.sortable ||
                            this.sortKeyword === tableHeader.label ? (
                              <span
                                class={`icon-arrow-up
                              ${
                                this.sortKeyword === tableHeader.label
                                  ? "active"
                                  : ""
                              }
                              ${
                                !this.sortOrder &&
                                this.sortKeyword === tableHeader.label
                                  ? "go-down"
                                  : ""
                              }`}
                              ></span>
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  ""
                )}

                {this.tableData.length && !this.loadingScreen
                  ? this.tableData.map((item) => {
                      return (
                        <div class="ibt-table_tr">
                          {this.bulkActions.length ? (
                            <div
                              class={`
                      ibt-table_td
                      checkbox
                      ${this.hasImage ? "has-image" : ""}
                      ${this.rowActions.length ? "has-row-actions" : ""}
                    `}
                            >
                              <ins-checkbox value={item}></ins-checkbox>
                            </div>
                          ) : (
                            ""
                          )}

                          {this.tableHeaders.map((tableHeader, index) => {
                            return (
                              <div
                                class={`ibt-table_td
                        ${
                          tableHeader.type === "number" ||
                          tableHeader.type === "currency"
                            ? "text-right"
                            : ""
                        }
                        ${tableHeader.hasLink ? "has-link" : ""}

                        ${
                          tableHeader.hasImage &&
                          (item[`${tableHeader.label}_Img`] ||
                            (item[tableHeader.label] &&
                              item[tableHeader.label] !== this.emptyValue))
                            ? "has-image"
                            : ""
                        }

                        ${
                          tableHeader.hasTag
                            ? `tagged ${
                                item[`${tableHeader.label}_tagClass`]
                                  ? item[`${tableHeader.label}_tagClass`]
                                  : tableHeader.multipleTags
                                  ? "multiple-tags"
                                  : item[tableHeader.label]
                              }`
                            : ""
                        }
                        ${tableHeader.editable ? `editable` : ""}
                        ${this.rowActions.length ? "has-row-actions" : ""}
                        ${
                          this.textOverflow === "ellipsis"
                            ? "overflow-ellipsis"
                            : ""
                        }
                        ${
                          tableHeader.textAlign
                            ? `text-${tableHeader.textAlign}`
                            : ""
                        }
                      `}
                              >
                                {tableHeader.hasImage &&
                                (item[tableHeader.label] ||
                                  item[`${tableHeader.label}_Img`]) ? (
                                  <div
                                    class={`img-wrap ${
                                      item[`${tableHeader.label}_Img`]
                                        ? ""
                                        : "use-fallback"
                                    }`}
                                  >
                                    {item[`${tableHeader.label}_Img`] ? (
                                      <img
                                        src={item[`${tableHeader.label}_Img`]}
                                      />
                                    ) : (
                                      <div class="img-fallback-wrap">
                                        {this.getInitials(
                                          item[tableHeader.label]
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  ""
                                )}

                                {item[tableHeader.label] ? (
                                  <div class="input-label-wrap">
                                    {!this.rowActions.length &&
                                    item["RowLink"] &&
                                    index === 0 ? (
                                      <a
                                        href={item["RowLink"]}
                                        class="ibt-link"
                                      >
                                        {tableHeader.type === "currency"
                                          ? `${
                                              this.currency
                                                ? this.currency
                                                : "$"
                                            }${item[tableHeader.label]}`
                                          : item[tableHeader.label]}
                                      </a>
                                    ) : (
                                      this.rowDataRenderer(item, tableHeader)
                                    )}

                                    {tableHeader.editable &&
                                    item.__editing_ins_base_table_item
                                      ? this.renderField(item, tableHeader)
                                      : ""}
                                  </div>
                                ) : (
                                  <div class="input-label-wrap 2">
                                    {tableHeader.editable &&
                                    item.__editing_ins_base_table_item
                                      ? this.renderField(item, tableHeader)
                                      : this.emptyValue}
                                  </div>
                                )}

                                {this.rowActions &&
                                this.canHaveRowActions(
                                  index,
                                  tableHeader /*, item*/
                                ) ? (
                                  <div class="action-wrap">
                                    {this.rowActions.map((rowAction) =>
                                      this.rowActionMapper(
                                        rowAction,
                                        item,
                                        tableHeader
                                      )
                                    )}
                                  </div>
                                ) : (
                                  ""
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  : ""}
              </div>

              <div
                class={`ibt-table-accordion ${
                  this.staticTable ? "static" : ""
                }`}
              >
                {this.tableHeaders.length ? this.renderMainMobileHeader() : ""}

                {this.tableData.length && !this.loadingScreen
                  ? this.tableData.map((item) => {
                      return (
                        <div class="ibt-table-accordion_row-td">
                          <div
                            class={`
                    ibt-table-accordion_row-head
                    ${this.bulkActions.length ? "has-checkbox" : ""}`}
                            onClick={(event) =>
                              this.toggleSelectOptionsWrap(event)
                            }
                          >
                            {this.bulkActions.length ? (
                              <div class="checkbox-wrap">
                                <ins-checkbox value={item}></ins-checkbox>
                              </div>
                            ) : (
                              ""
                            )}

                            {this.renderMobileRowHeader(item)}

                            <i class="icon-caret-down"></i>
                            <i class="icon-caret-up"></i>
                          </div>

                          <div
                            class="ibt-table-accordion_row-body"
                            data-opened="false"
                          >
                            <table>
                              {this.tableHeaders.map((tableHeader) => {
                                return (
                                  <tr>
                                    <td class="column-label">
                                      {tableHeader.label}
                                    </td>
                                    <td
                                      class={`
                              ${tableHeader.editable ? "editable" : ""}
                              ${tableHeader.hasLink ? "ibta-td-has-link" : ""}
                              ${
                                tableHeader.hasTag
                                  ? `tagged ${
                                      item[`${tableHeader.label}_tagClass`]
                                        ? item[`${tableHeader.label}_tagClass`]
                                        : tableHeader.multipleTags
                                        ? "multiple-tags"
                                        : item[tableHeader.label]
                                    }`
                                  : ""
                              }`}
                                    >
                                      {item[tableHeader.label] ? (
                                        <div>
                                          {!this.rowActions.length &&
                                          item["RowLink"] ? (
                                            <a
                                              href={item["RowLink"]}
                                              class="ibt-link"
                                            >
                                              {tableHeader.type === "currency"
                                                ? `${
                                                    this.currency
                                                      ? this.currency
                                                      : "$"
                                                  }${item[tableHeader.label]}`
                                                : item[tableHeader.label]}
                                            </a>
                                          ) : (
                                            this.rowDataRenderer(
                                              item,
                                              tableHeader
                                            )
                                          )}
                                          {tableHeader.editable &&
                                          item.__editing_ins_base_table_item
                                            ? this.renderField(
                                                item,
                                                tableHeader
                                              )
                                            : ""}
                                        </div>
                                      ) : (
                                        <span>-</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </table>

                            {this.rowActions ? (
                              <div class="action-wrap">
                                {this.rowActions.map((rowAction) =>
                                  this.rowActionMapper(rowAction, item, "")
                                )}
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      );
                    })
                  : ""}
              </div>

              {this.loadingScreen ? (
                <div class={`loading-screen`}>
                  <ins-loader
                    image-source={this.loaderImageSource}
                    state-title={this.loaderTitle}
                    state-message={this.loaderMessage}
                    state-icon={this.loaderIcon}
                  ></ins-loader>
                </div>
              ) : (
                ""
              )}
            </div>
          )}

          {/* Pagination */}
          <div
            class={`ibt-table-wrap__settings
            ${this.withoutPagination ? "no-pagination" : ""}`}
          >
            {this.bulkActions.length ? (
              <div class="ibt-table-action-container">
                <ins-select
                  data-type="bulk-action"
                  disabled={!this.selectedRows.length}
                  placeholder="Bulk Actions"
                  small
                  button
                >
                  {this.bulkActions.map((action) => {
                    return (
                      <ins-select-option
                        label={action}
                        value={action}
                        default={this.selectedBulkAction === action}
                      ></ins-select-option>
                    );
                  })}
                </ins-select>
                <ins-button
                  class="insTableBulkButton"
                  label="Apply"
                  size="small"
                  solid
                  disabled={!this.selectedRows.length}
                ></ins-button>
              </div>
            ) : (
              ""
            )}
            {this.withoutPagination ? (
              ""
            ) : (
              <div
                class={`pagination-wrap ${
                  this.bulkActions.length ? "" : "full"
                }`}
              >
                <div class="ibt-table-wrap__page-nav">
                  <div class="ibt-table-wrap__pagination">
                    <span>{this.paginationText}</span>
                    <select
                      class="ibt-table-wrap__pagination--option"
                      onChange={(event) => this.pageSizeChangeHandler(event)}
                    >
                      {this.pageSizeOptions
                        ? this.pageSizeOptions.map((option) => (
                            <option
                              value={option}
                              selected={this.pageSize == option}
                            >
                              {option}
                            </option>
                          ))
                        : ""}
                    </select>
                  </div>
                  <div class="ibt-table-wrap__page">{this.pageInfo}</div>
                </div>
                <div class="ibt-table-wrap__prev-next">
                  <button
                    name="button-table_first"
                    class="first button-table_first"
                    onClick={() => this.pageNumberChangeHandler("first")}
                    disabled={this.pageNumber === 1}
                    aria-label="first"
                  >
                    <i class={`icon-chevrons-left`}></i>
                  </button>

                  <button
                    name="button-table_previous"
                    class="prev button-table_previous"
                    onClick={() => this.pageNumberChangeHandler("prev")}
                    disabled={this.pageNumber === 1}
                    aria-label="previous"
                  >
                    <i class={`icon-angle-left`}></i>
                  </button>

                  {this.renderPageNumbers().map((page) => {
                    return (
                      <button
                        name={`button-page_${page}`}
                        class={`page button-pages ${
                          this.pageNumber === page ? "active" : ""
                        }`}
                        onClick={() => this.pageNumberChangeHandler(page)}
                        disabled={this.pageNumber === page}
                        aria-label={`page-${page}`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    name="button-table_next"
                    class="next button-table_next"
                    onClick={() => this.pageNumberChangeHandler("next")}
                    disabled={
                      this.pageNumber * this.pageSize >= this.totalCount
                    }
                    aria-label="next"
                  >
                    <i class={`icon-angle-right`}></i>
                  </button>

                  {!this.isTotalCountEstimated &&
                    !this.totalCountLoading &&
                    !this.totalCountLoadingFailed && (
                    <button
                      name="button-table_last"
                      class="last button-table_last"
                      onClick={() => this.pageNumberChangeHandler("last")}
                      disabled={
                        this.pageNumber * this.pageSize >= this.totalCount
                      }
                      aria-label="last"
                    >
                      <i class={`icon-chevrons-right`}></i>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
