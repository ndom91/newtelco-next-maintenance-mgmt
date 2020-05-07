
            <style jsx>{`
                :global(.flip-transition-enter) {
                  opacity: 0;
                  transform: rotateY( 180deg );
                }
                :global(.flip-transition-enter-active) {
                  opacity: 1;
                  transform: translateX(0);
                  transform: rotateY( 360deg );
                  transition: opacity 0.9s, transform 0.9s;
                }
                :global(.flip-transition-exit) {
                  opacity: 0;
                  transform: rotateY( 180deg );
                }
                :global(.flip-transition-exit-active) {
                  opacity: 1;
                  transform: translateX(0);
                  transform: rotateY( 360deg );
                  transition: opacity 0.9s, transform 0.9s;
                }
                :global(.time-line-ctnr) {
                  margin-top: 15px;
                }
                :global(.time-line-ctnr .time-line > li > .fa) {
                  border-color: #67B246 !important;
                }
                :global(.time-line-ctnr .time-line:before) {
                  background: #67B246 !important;
                }
                :global(.time-line-ctnr .time-line > li > .time-line-item .time-line-header) {
                  background-color: var(--primary-bg) !important;
                  color: var(--font-color) !important;
                  border-bottom: none !important;
                }
                :global(.time-line-ctnr .time-line > li > .time-line-item) {
                  box-shadow: none !important;
                }
                :global(.time-label span) {
                  background-color: #67B246 !important;
                }
                :global(.delete-modal.modal-body) {
                  background-color: var(--primary-bg);
                  color: var(--font-color);
                }
                :global(.modal-delete-header) {
                  background: var(--secondary-bg);
                  color: var(--font-color);
                  display: flex;
                  justify-content: flex-start;
                  align-content: center;
                }
                :global(.modal-body.reschedule) {
                  background-color: var(--primary-bg);
                }
                :global(.modal-preview-send-backdrop) {
                  opacity: 0.8 !important;
                }
                :global(.reschedule-modal) {
                  max-width: 600px;
                }
                :global(.modal-header.reschedule *) {
                  color: var(--font-color);
                }
                :global(.modal-header.reschedule) {
                  background: var(--secondary-bg);
                  color: var(--font-color);
                  display: flex;
                  justify-content: flex-start;
                  align-content: center;
                }
                :global(.reschedule-header:hover) {
                  cursor: move;
                }
                :global(.container-border) {
                  border: 1px solid var(--border-color);
                  border-radius: 0.325rem;
                  margin: 10px 0;
                  padding: 1.5rem;
                }
                :global(.ExcelTable2007) {
                  border: 1px solid #ddd;
                  border-collapse: collapse;
                }
                :global(.ExcelTable2007 td, th) {
                  white-space: nowrap;
                  border: 1px solid #ddd;
                  padding: 20px;
                }
                :global(.ExcelTable2007 th) {
                  background-color: #eee;
                  position: sticky;
                  top: -1px;
                  z-index: 2;
                }
                :global(.ExcelTable2007 th:first-of-type) {
                  left: 0;
                  z-index: 3;
                }
                :global(.ExcelTable2007 > tbody > tr > td:first-of-type) {
                  background-color: #eee;
                  position: sticky;
                  left: -1px;
                  z-index: 1;
                }
                :global(.reschedule-btn) {
                  font-size: .85rem;
                  font-weight: 500;
                  padding: .50rem;
                  border-width: 2px;
                  width: 105px;
                  min-height: 88px;
                  max-height: unset;
                }
                :global(.reschedule-btn:hover, .reschedule-btn:active, .reschedule-btn:focus) {
                  background-color: var(--primary-bg);
                  color: #67B246;
                  box-shadow: 0 0 5px 1px #67B246;
                }
                :global(.react-draggable) {
                  transition: visibility 200ms linear, opacity 200ms linear;
                }
                :global(div[class$="-singleValue"]) {
                  font-size: 0.95rem;
                  color: #495057;
                }
                :global(.form-group > label) {
                  margin: 10px !important;
                }
                :global(.form-group) {
                  margin-bottom: 0px !important;
                }
                :global(.container) {
                  padding: 15px;
                }
                .mail-icon {
                  min-width: 110px;
                  height: 110px;
                  border: 2px solid var(--light);
                  background: var(--white);
                  padding: 10px;
                  border-radius: 5px;
                  margin-right: 10px;
                }
                :global(.MuiFormControl-root) {
                  width: 100%;
                }
                :global(.MuiInputBase-root) {
                  color: #495057;
                }
                :global(#impact::placeholder) {
                  color: var(--border-color);
                }
                :global(.MuiInputBase-root:hover) {
                  border-color: #8fa4b8 !important;
                }
                :global(.MuiOutlinedInput-input) {
                  padding: 10.5px 14px;
                  transition: box-shadow 250ms cubic-bezier(.27,.01,.38,1.06),border 250ms cubic-bezier(.27,.01,.38,1.06);
                }
                :global(.card-header h2) {
                  color: var(--font-color);
                  font-weight: 100 !important;
                }
                :global(.modal-attachment-header-text > .modal-title) {
                  font-weight: 100 !important;
                  font-family: Poppins, Roboto !important;
                }
                :global(.modal-incoming-header-text .input-group-prepend .input-group-text) {
                  background-color: #272727;
                }
                :global(.modal-incoming-header-text input.form-control) {
                  background-color: #373737;
                }
                :global(.modal-incoming-header-text input.form-control:hover) {
                  cursor: move;
                }
                :global(.modal-incoming-header-text) {
                  flex-grow: 1;
                  margin-right: 20px;
                  margin-top: 7px;
                }
                :global(.modal-read-header > .modal-title) {
                  flex-wrap: wrap;
                }
                :global(.modal-read-header:hover) {
                  cursor: move;
                }
                :global(.modal-preview-text-wrapper) {
                  width: 89%;
                }
                :global(.modal-preview-text-wrapper input:hover) {
                  cursor: default !important;
                }
                :global(.modal-preview-text-wrapper input::placeholder) {
                  color: var(--font-color);
                }
                :global(.modal-preview-send .modal-header) {
                  background-color: var(--secondary-bg);
                }
                :global(.modal-preview-send .modal-body) {
                  background-color: var(--primary-bg);
                }
                :global(.modal-preview-send .input-group-prepend .input-group-text) {
                  background-color: var(--primary-bg);
                }
                :global(.modal-preview-send .input-group input.form-control) {
                  cursor: default;
                }
                :global(.modal-preview-paperplane-icon) {
                  color: var(--font-color);
                }
                :global(.modal-preview-paperplane-icon:hover) {
                  color: #f8f9fa;
                }
                :global(.maint-select [class$='-menu']) {
                  z-index: 2000;
                }
                :global(.maint-select [class$='-placeholder']) {
                  color: var(--border-color) !important;
                }
                :global(.maint-select *) {
                  background-color: var(--input);
                  color: var(--font-color) !important;
                }
                :global(.maint-select div[class$="-multiValue"]) {
                  background-color: var(--input);
                  color: var(--font-color);
                  border: 1px solid var(--border-color);
                  border-radius: 5px;
                }
                :global(.maint-select div[class$="-singleValue"]) {
                  background-color: var(--input);
                  color: var(--font-color);
                }
                :global(.Mui-focused) {
                  border: none !important;
                }
                :global(.tox .tox-tbtn svg) {
                  fill: var(--font-color) !important;
                }
                :global(.tox .tox-tbtn) {
                  color: var(--font-color) !important;
                }
                :global(.tox-menubar .tox-mbtn) {
                  background: var(--secondary-bg) !important;
                  color: var(--inv-font-color) !important;
                }
                :global(.tox .tox-tbtn:hover:not(.tox-tbtn--disabled)) {
                  background: var(--secondary-bg) !important;
                  color: var(--inv-font-color) !important;
                }
                :global(.tox .tox-edit-area__iframe *) {
                  color: var(--font-color) !important;
                }
                :global(#tinymce) {
                  color: var(--font-color) !important;
                }
                :global(.tox .tox-edit-area__iframe) {
                  background-color: var(--primary-bg) !important;
                }
                :global(.progress) {
                  background-color: var(--inv-font-color);
                }
                :global(.MuiInputBase-root:focus-within) {
                  color: #495057;
                  background-color: var(--input);
                  border: 1px solid #67B246 !important;
                  border-radius: 0.325rem;
                  box-shadow: 0 0.313rem 0.719rem rgba(0,123,255,.1), 0 0.156rem 0.125rem rgba(0,0,0,.06);
                }
                :global(.MuiIconButton-root:hover) {
                  background-color: none !important;
                }
                :global(.fa-language) {
                  font-size: 20px;
                }
                :global(.modal-lg) {
                  max-width: 1000px !important;
                }
                :global(.tox-toolbar__group) {
                  border-right: none !important;
                }
                :global(.tox-tinymce) {
                  border-radius: 5px !important;
                }
                :global(.tox-toolbar) {
                  background: none !important;
                }
                :global(.tox-edit-area__iframe *) {
                  color: #fff;
                }
                :global(.maintenance-subcontainer) {
                  border: 1px solid var(--border-color);
                  border-radius: 0.325rem;
                  margin: 10px 0;
                }
                :global(.form-group-toggle label) {
                  display: flex;
                  justify-content: space-evenly;
                  align-items: center;
                  height: 30px;
                }
                :global(.form-group-toggle > .badge) {
                  flex-grow: 1;
                  margin-left: 5px;
                  margin-right: 5px;
                }
                :global(.form-group-toggle) {
                  display: flex;
                  justify-content: space-around;
                  align-items: center;
                }
                :global(.ag-cell.ag-cell-inline-editing) {
                  padding: 10px !important;
                  height: inherit !important;
                }
                .toggle-done {
                  border: 1px solid var(--secondary);
                  border-radius: 0.325rem;
                  padding: 20px;
                }
                :global(.btn-toolbar .badge-outline-secondary) {
                  box-shadow: unset;
                }
                :global(.form-group-toggle > .badge-outline-secondary) {
                  border: ${this.state.night ? '1px solid #fff' : ''};
                }
                :global(.badge-outline-secondary > label) {
                  color: var(--font-color);
                }
                :global(.badge-outline-light > label) {
                  color: var(--font-color);
                }
                :global(.rdw-option-active) {
                  box-shadow: none;
                  border: 2px solid var(--primary);
                  border-radius: 5px;
                }
                :global(.editor-toolbar) {
                  transition: all 150ms ease-in-out;
                }
                :global(.editor-dropdown) {
                  position: relative;
                  font-family: inherit;
                  background-color: transparent;
                  padding: 2px 2px 2px 0;
                  font-size: 10px;
                  border-radius: 0;
                  border: none;
                  border-bottom: 1px solid rgba(0,0,0, 0.12);
                  transition: all 150ms ease-in-out;
                }
                :global(.editor-wrapper) {
                  border: 1px solid var(--light);
                  border-radius: 5px;
                }
                :global(.editor-wrapper) {
                  padding: 5px;
                }
                :global(button.btn-primary) {
                }
                input {
                  display: block;
                }
                label {
                  margin: 15px;
                }
                :global(.modal-content) {
                  max-height: calc(${this.state.windowInnerHeight}px - 50px);
                }
                :global(.modal-attachment-header-text ~ .modal-body) {
                  padding: 0px !important;
                  margin: 2px !important;
                }
                :global(.attachment-body) {
                  height: auto;
                  padding: 30px;
                  font-family: Poppins, Helvetica;
                  background: var(--primary-bg);
                  color: var(--font-color);
                  overflow: ${this.state.incomingMailIsHtml ? 'scroll' : 'scroll'};
                }
                :global(.attachment-body.html) {
                  max-height: 500px;
                  overflow: scroll;
                }
                :global(.attachment-body.html *) {
                  color: #6c757d;
                }
                :global(.mail-body) {
                  font-family: Poppins, Helvetica;
                  height: ${this.state.readHeight ? `calc(${this.state.readHeight} - 127px)` : '460px'};
                  background: var(--primary-bg);
                  color: var(--font-color);
                  overflow-y: ${this.state.incomingMailIsHtml ? 'scroll' : 'scroll'};
                }
                :global(.mail-body > pre:first-child) {
                  color: var(--font-color);
                }
                :global(.mail-body > div:first-child) {
                  position: ${this.state.incomingMailIsHtml ? 'relative' : 'absolute'};
                  top: 0;
                  left: 0;
                  height: ${this.state.incomingMailIsHtml ? '100vh' : '100%'};
                  width: 100%;
                  padding: 40px;
                  overflow-y: ${this.state.incomingMailIsHtml ? 'hidden' : 'scroll'};
                }
                :global(.modal-backdrop) {
                  background-color: #000;
                  transition: all 150ms ease-in-out;
                }
                :global(.modal-backdrop.show) {
                  opacity: 0.5;
                }
                .modal-incoming-header-text {
                  flex-grow: 1;
                }
                :global(.modal-title) {
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
                  align-items: center;
                }
                :global(.modal-content) {
                  max-height: calc(${this.state.windowInnerHeight}px - 50px);
                }
                :global(.flexible-modal) {
                  position: absolute;
                  z-index: 1;
                  border: 1px solid #ccc;
                  background: white;
                }
                :global(.flexible-modal-mask) {
                  position: fixed;
                  height: 100%;
                  background: rgba(55, 55, 55, 0.6);
                  top:0;
                  left:0;
                  right:0;
                  bottom:0;
                }
                :global(.flexible-modal-resizer) {
                  position:absolute;
                  right:0;
                  bottom:0;
                  cursor:se-resize;
                  margin:5px;
                  border-bottom: solid 2px #333;
                  border-right: solid 2px #333;
                }
                :global(.flexible-modal-drag-area) {
                  background: #67B246;
                  height: 50px;
                  position:absolute;
                  right:0;
                  top:0;
                  cursor:move;
                }
                .modal-incoming-header-text > * {
                  color: var(--white);
                }
                :global(.modal-attachment-header-text ~ .modal-body) {
                  background-color: var(--primary-bg);

                }
                :global(.modal-attachment-header-text:hover) {
                  cursor: move;
                }
                :global(.modal-attachment-header-text > h5) {
                  color: var(--white);
                }
                :global(.close-attachment-modal-btn:hover > .close-attachment-modal-icon) {
                  color: var(--dark) !important;
                }
                :global(.close-read-modal-btn:hover > .close-read-modal-icon) {
                  color: var(--dark) !important;
                }
                :global(.form-group label) {
                  color: var(--font-color);
                }
                :global(.form-control, .form-control) {
                  color: var(--font-color);
                  background-color: var(--input);
                }
                :global(.form-control:disabled, .form-control[readonly]) {
                  color: var(--font-color);
                  background-color: var(--disabled-input);
                }
                :global(.card-header .btn) {
                  height: 47px !important;
                }
                :global(.btn-outline-secondary) {
                  color: var(--font-color);
                }
                :global(.flatpickr) {
                  height: auto;
                  width: 100%;
                  padding: .5rem 1rem;
                  font-size: .95rem;
                  line-height: 1.5;
                  color: var(--font-color);
                  background-color: var(--input);
                  border: 1px solid #becad6;
                  font-weight: 300;
                  will-change: border-color,box-shadow;
                  border-radius: .375rem;
                  box-shadow: none;
                  transition: box-shadow 250ms cubic-bezier(.27,.01,.38,1.06),border 250ms cubic-bezier(.27,.01,.38,1.06);
                }
                :global(.flatpickr-months) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-month) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-monthDropdown-months) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-weekdays) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-weekday) {
                  background: #67B246 !important;
                }
                :global(.flatpickr-day.selected) {
                  background: #67B246 !important;
                  border-color: #67B246 !important;
                }
                :global(.create-btn) {
                  box-shadow: ${this.state.maintenance.id === 'NEW' ? '0 0 0 100vmax rgba(0,0,0,.8)' : 'none'};
                  pointer-events: ${this.state.maintenance.id === 'NEW' ? 'auto' : 'none'};
                  z-index: 100;
                }
                :global(*) {
                  pointer-events: ${this.state.maintenance.id === 'NEW' ? 'none' : 'auto'};
                }
                :global(.create-btn:before) {
                  
                }
                .impact-title-group {
                  display: flex;
                }
                :global(.row-frozen) {
                  border: 1px solid #dc3545;
                  box-shadow: 0 0 5px 1px #dc3545;
                  background-color: #dc35451f;
                  width: 100%;
                }
                :global(.changelog-wrapper) {
                  max-height: 1020px;
                  margin-top: 10px;
                  overflow-y: scroll;
                }
                :global(.maintenance-subcontainer .badge label) {
                  flex-direction: column;
                  justify-content: space-between;
                  height: 50px;
                  margin: 10px !important;
                }
                :global(.Popover-body) {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  padding: 10px;
                  width: 200px;
                  transform: translateY(-6px);
                }
                :global(.Popover-tip) {
                  transform: translateX(95px) translateY(-7px) !important;
                  fill: var(--primary-bg);
                }
                :global(.Popover) {
                  z-index: 2000;
                  background-color: var(--primary-bg);
                  border: 1px solid var(--border-color);
                  color: var(--font-color);
                  border-radius: 15px;
                  box-shadow: 0 0 15px 1px var(--third-bg);
                }
                :global(.form-group-toggle.form-group > .badge) {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  min-height: 80px;
                }
                @media only screen and (max-width: 500px) {
                  :global(html) {
                    max-width: ${this.state.width}px;
                  }
                  :global(.col) {
                    padding: 0 5px;
                  }
                  :global(.card-footer) {
                    padding: 0.75rem;
                  }
                  :global(.card-footer .btn) {
                    padding: 0.5rem 0.25rem !important;
                    height: 50px !important;
                  }
                  :global(.impact-row) {
                    padding: 10px;
                  }
                  :global(.navbar) {
                    position: fixed;
                    z-index: 1000;
                    width: 100%;
                  }
                  :global(.changelog-wrapper) {
                    max-height: 600px;
                    overflow-y: scroll;
                  }
                  :global(.top-card-wrapper) {
                    margin-top: 60px;
                  }
                  :global(.maintenance-subcontainer .badge label) {
                    font-size: 1.2em;
                    flex-direction: column;
                    margin: 0px;
                    height: 50px;
                  }
                  :global(.maint-header-text-wrapper) {
                    flex-direction: row !important;
                    flex-wrap: nowrap;
                  }
                  :global(div.btn-toolbar > .btn-group-md) {
                    width: 100%;
                    margin-bottom: 10px;
                  }
                  :global(.btn-group-2) {
                    width: 100%;
                  }
                  :global(.btn-toolbar .btn div) {
                    max-height: 80px !important;
                    display: flex !important;
                    flex-direction: row;
                    justify-content: space-around;
                    align-items: center;
                    width: 100%;
                  }
                  :global(.btn-toolbar .btn) {
                    max-height: 80px !important;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    align-items: center;
                  }
                  :global(.btn-toolbar .btn svg) {
                    margin-right: 0px !important;
                  }
                  :global(.card-footer .btn svg) {
                    margin-right: 0px !important;
                  }
                  :global(.card-footer .btn) {
                    max-height: 53px !important;
                    height: 53px;
                    padding: .25rem 0.9rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    align-items: center;
                  }
                  :global(div.btn-toolbar) {
                  }
                  :global(div.btn-toolbar > span) {
                    display: flex;
                    justify-content: space-around;
                    flex-wrap: wrap;
                    flex-direction: column;
                    flex-grow: 1;
                    margin-top: 2%;
                  }
                  :global(div.btn-toolbar > span > .badge.badge-outline-secondary) {
                    font-size: 1.8rem !important;
                    margin-right: 0 !important;
                  }
                  :global(div.btn-toolbar > span > h2) {
                    margin: 5px;
                    padding-right: 20px;
                    font-size: 1.5em;
                    max-width: 170px;
                  }
                  :global(.card-header h2) {
                    margin-top: 5px;
                  }
                  :global(.card-header) {
                    height: 120px;
                  }
                  :global(.card-body) {
                    padding: 0px;
                  }
                }
              `}
            </style>