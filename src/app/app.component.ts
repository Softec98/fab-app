import { Component } from '@angular/core';
import { ETheme } from '../app/Core/ENums/ETheme.enum';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'App-Vendas';
  icon = ETheme.ICON_MOON;
  textTheme = ETheme.TEXT_MOON;
  hideSideMenu = false;

  constructor(private responsive: BreakpointObserver) { }
  async ngOnInit() {
    this.responsive.observe([
      Breakpoints.HandsetPortrait,
    ])
      .subscribe(result => {
        this.hideSideMenu = false;
        if (!result.matches) {
          this.hideSideMenu = true;
        }
      });
  }

  public toggle() {
    const theme = document.body.classList.toggle('dark-theme');
    if (theme) {
      this.textTheme = ETheme.TEXT_SUN;
      return (this.icon = ETheme.ICON_SUN);
    }
    this.textTheme = ETheme.TEXT_MOON;
    return (this.icon = ETheme.ICON_MOON);
  }
}