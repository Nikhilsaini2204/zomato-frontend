import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageModule } from './homepage/homepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProfileComponent } from './profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NavbarComponent } from './homepage/navbar/navbar.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { RequestComponent } from './request/request.component';

@NgModule({
  declarations: [AppComponent, ProfileComponent, SearchResultsComponent, RequestComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HomepageModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right', 
      preventDuplicates: true,
      progressBar: true,
      tapToDismiss: true,
      timeOut: 2500,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
