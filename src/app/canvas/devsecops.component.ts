import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';

import { foWorkspace } from '../foundry/foWorkspace.model';
import { foPage } from '../foundry/shapes/foPage.model';
import { foModel } from '../foundry/foModel.model';

import { Screen2D } from '../foundry/shapes/canvasDriver';
import { foDocument } from '../foundry/shapes/foDocument.model';

import { cPoint2D } from '../foundry/shapes/foGeometry2D';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

import { Toast } from '../common/emitter.service';
import { SharingService } from '../common/sharing.service';
import { DevSecOps } from './devsecops.model';

import { BoidStencil, boidBehaviour } from './boid.model';
import { FactoryStencil, factoryBehaviour } from './factory.model';
import { foCommand, foToggle } from '../foundry/foController';

import { Star } from 'konva';

@Component({
  selector: 'fo-devsecops',
  templateUrl: './devsecops.component.html',
  styleUrls: ['./devsecops.component.css']
})
export class DevSecOpsComponent implements OnInit, AfterViewInit {
  showZones: boolean = true;
  workspace: foWorkspace = DevSecOps;
  model: foModel = DevSecOps.model.getItem('default');

  @ViewChild('canvas') public canvasRef: ElementRef;

  @Input() public pageWidth = 1400;
  @Input() public pageHeight = 800;

  screen2D: Screen2D = new Screen2D();
  currentDocument: foDocument;

  constructor(private sharing: SharingService) {}

  doOpen() {
    this.workspace.openFile(result => {
      Toast.info('open', result.filename);
      this.workspace.reHydratePayload(result.payload);
    });
  }

  doSave() {
    this.workspace.SaveInstanceAs(
      this.workspace.activePage,
      'page1',
      '.json',
      result => {
        Toast.info('saved', result.filename);
      }
    );
  }

  doClear() {
    this.workspace.clearActivePage();
  }

  doSaveWorkspace() {
    this.workspace.SaveFileAs('work', '.json', result => {
      Toast.info('saved', result.filename);
    });
  }

  ngOnInit() {
    const space = this.workspace;

    space.stencil.add(FactoryStencil);
    space.controller.add(factoryBehaviour);

    factoryBehaviour.addCommands(
      new foCommand('layout', () => {
        const page = space.activePage;
        const shape = factoryBehaviour.buildLayout(page);
        page.centerShape( shape );
      })
    );

    // factoryBehaviour.addCommands(new foCommand('grid', () => {
    //   factoryBehaviour.buildGrid(space.activePage);
    // }));

    factoryBehaviour.addCommands(
      new foCommand('create package', () => {
        factoryBehaviour.createPackage(space.activePage);
      })
    );

    factoryBehaviour.addCommands(
      new foCommand('build factory', () => {
        factoryBehaviour.buildFactory(space.activePage);
      })
    );

    factoryBehaviour.addCommands(
      new foCommand('run', () => {
        factoryBehaviour.runFactory(space.activePage);
      })
    );

    space.library.members.forEach(lib => {
      lib.solutions.publicMembers.forEach(know => {
        factoryBehaviour.addCommands(
          new foCommand(know.myName, () => {
            const model = space.model.establish('default');
            const item = know.makeComponent(model).defaultName();
            factoryBehaviour.renderModel(space.activePage, item);
          })
        );
      });
    });

    space.stencil.add(BoidStencil);
    space.controller.add(boidBehaviour);

    boidBehaviour.addCommands(
      new foCommand('100++', () => {
        boidBehaviour.creatBoids(space.activePage, 100);
      })
    );

    boidBehaviour.addCommands(
      new foCommand('+1', () => {
        boidBehaviour.creatBoids(space.activePage, 1);
      })
    );

    const root = this;
    boidBehaviour.addToggle(
      new foToggle(
        'zone',
        () => {
          root.showZones = !root.showZones;
          const page = space.activePage;
          page.Subcomponents.forEach(boid => {
            boid.isVisible = root.showZones;
          });
        },
        () => {
          return { active: root.showZones };
        }
      )
    );

    this.currentDocument = this.workspace.document.override({
      pageWidth: this.pageWidth,
      pageHeight: this.pageHeight
    });

    this.model = this.workspace.model.establish('default');
    //this.model = workspace.context()
  }

  public ngAfterViewInit() {
    this.screen2D.setRoot(
      this.canvasRef.nativeElement,
      this.pageWidth,
      this.pageHeight
    );

    this.sharing.startSharing();

    setTimeout(_ => {
      this.doSetCurrentPage(this.currentDocument.currentPage);
    });
  }

  addEventHooks(page: foPage) {
    page.onItemHoverEnter = (
      loc: cPoint2D,
      shape: foGlyph2D,
      keys?: any
    ): void => {
      if (shape) {
        shape.drawHover = function(ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 4;
          shape.drawOutline(ctx);
        };
      }
    };

    page.onItemHoverExit = (
      loc: cPoint2D,
      shape: foGlyph2D,
      keys?: any
    ): void => {
      if (shape) {
        shape.drawHover = undefined;
      }
    };

    page.onItemOverlapEnter = (
      loc: cPoint2D,
      shape: foGlyph2D,
      shapeUnder: foGlyph2D,
      keys?: any
    ): void => {
      if (shapeUnder) {
        shapeUnder.drawHover = function(ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 8;
          shapeUnder.drawOutline(ctx);
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 4;
          shapeUnder.drawOutline(ctx);
        };
      }
    };

    page.onItemOverlapExit = (
      loc: cPoint2D,
      shape: foGlyph2D,
      shapeUnder: foGlyph2D,
      keys?: any
    ): void => {
      if (shapeUnder) {
        shapeUnder.drawHover = undefined;
      }
    };
  }

  doSetCurrentPage(page: foPage) {
    this.screen2D.clear();
    page.canvas = this.canvasRef.nativeElement;

    //with the render function you could
    //1) render a single page
    //2) render pages like layers
    //3) render pages side by side
    this.screen2D.render = (ctx: CanvasRenderingContext2D) => {
      page.render(ctx);
    };
    this.screen2D.go();

    this.addEventHooks(page);
  }
}
