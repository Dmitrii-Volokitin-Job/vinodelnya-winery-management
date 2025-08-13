import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DividerModule } from 'primeng/divider';

interface HelpSection {
  title: string;
  content: string;
  icon?: string;
}

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    ScrollPanelModule,
    DividerModule
  ],
  template: `
    <p-dialog
      header="📚 Help & Information"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '700px', height: '600px' }"
      [draggable]="false"
      [resizable]="true"
      styleClass="help-dialog"
      (onHide)="onClose()"
    >
      <div class="help-content">
        <div class="help-header">
          <h3>{{ componentTitle }}</h3>
          <p class="help-description">{{ componentDescription }}</p>
        </div>
        
        <p-scrollPanel [style]="{ width: '100%', height: '400px' }">
          <div class="help-sections">
            <div 
              *ngFor="let section of helpSections; let i = index" 
              class="help-section"
            >
              <div class="section-header">
                <i *ngIf="section.icon" [class]="section.icon" class="section-icon"></i>
                <h4>{{ section.title }}</h4>
              </div>
              <div class="section-content" [innerHTML]="section.content"></div>
              <p-divider *ngIf="i < helpSections.length - 1"></p-divider>
            </div>
          </div>
        </p-scrollPanel>
      </div>

      <ng-template pTemplate="footer">
        <div class="help-footer">
          <small class="help-tip">
            💡 <strong>Tip:</strong> Press <kbd>F1</kbd> anytime to access help for the current page
          </small>
          <p-button 
            label="Got it!" 
            icon="pi pi-check" 
            (onClick)="onClose()"
            styleClass="p-button-primary"
          ></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .help-content {
      padding: 0;
    }

    .help-header {
      margin-bottom: 1.5rem;
      text-align: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .help-header h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 1.5rem;
    }

    .help-description {
      color: #64748b;
      margin: 0;
      font-size: 1.1rem;
    }

    .help-sections {
      padding: 1rem 0;
    }

    .help-section {
      margin-bottom: 1.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .section-icon {
      color: #3b82f6;
      font-size: 1.2rem;
    }

    .section-header h4 {
      margin: 0;
      color: #1e293b;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .section-content {
      line-height: 1.6;
      color: #374151;
    }

    .section-content :global(ul) {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .section-content :global(li) {
      margin-bottom: 0.25rem;
    }

    .section-content :global(code) {
      background: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }

    .section-content :global(strong) {
      color: #1e293b;
    }

    .help-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .help-tip {
      color: #64748b;
      font-style: italic;
    }

    .help-tip kbd {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      padding: 0.1rem 0.3rem;
      font-size: 0.8rem;
      font-family: monospace;
    }

    :global(.help-dialog) {
      margin-top: 5vh;
    }

    :global(.help-dialog .p-dialog-content) {
      padding: 1.5rem;
      overflow: hidden;
    }

    :global(.help-dialog .p-dialog-footer) {
      padding: 1rem 1.5rem;
    }
  `]
})
export class HelpModalComponent {
  @Input() visible: boolean = false;
  @Input() componentTitle: string = 'Help';
  @Input() componentDescription: string = 'Learn how to use this feature';
  @Input() helpSections: HelpSection[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}