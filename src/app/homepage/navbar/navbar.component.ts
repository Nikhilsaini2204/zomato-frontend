import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { OtpService } from 'src/app/services/otp.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(
    private otpService: OtpService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private httpClient: HttpClient,
    private eRef: ElementRef
  ) {
    // this.searchChanged
    //   .pipe(
    //     debounceTime(300), // Wait for 300ms pause
    //     distinctUntilChanged(), // Ignore if next search term is same
    //     switchMap((term) => this.fetchSearchSuggestions(term))
    //   )
    //   .subscribe((results) => {
    //     this.searchResults = results;
    //   });
  }

  myForm!: FormGroup;
  searchInput = '';
  searchResults: { restaurants: any[]; dishes: any[] } = {
    restaurants: [],
    dishes: [],
  };

  searchChanged = new Subject<string>();
  showLoginModal = false;
  showSignupModal = false;
  isPhoneVerified = false;
  isOtpSent = false;
  otpError = false;
  loginForm!: FormGroup;
  isLoggedIn = false;

  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      number: [null, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]],
      address: [null, [Validators.required]],
    });

    this.loginForm = this.formBuilder.group({
      countryCode: ['+91', Validators.required],
      phone: [null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]],
    });

    this.authService.isLoggedIn().subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  onSearchInputChange() {
    if (!this.searchInput.trim()) {
      this.searchResults = { restaurants: [], dishes: [] };
      return;
    }

    const params = new HttpParams().set('name', this.searchInput);
    const restaurantSearch = this.httpClient.get<any[]>(
      'http://localhost:8090/v1/restaurant/filters',
      {
        params,
      }
    );

    const dishSearch = this.httpClient.get<any[]>(
      `http://localhost:8090/v1/dish/dishName`,
      {
        params,
      }
    );

    forkJoin([restaurantSearch, dishSearch]).subscribe({
      next: ([restaurants, dishes]) => {
        this.searchResults = { restaurants, dishes };
      },
      error: (err) => {
        console.error('Search API error', err);
        this.searchResults = { restaurants: [], dishes: [] };
      },
      complete: () => {
      },
    });    
  }

  
  goToRestaurant(restaurantId: string) {
    this.searchInput = '';
    this.searchResults = { restaurants: [], dishes: [] };
    this.router.navigate(['/restaurant', restaurantId]);
  }

  goToDish(dishId: string) {
    this.searchInput = '';
    this.searchResults = { restaurants: [], dishes: [] };
    this.router.navigate(['/dish', dishId]);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.searchInput = '';
      this.searchResults = { restaurants: [], dishes: [] }; // Hide dropdown
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  sendLoginOtp() {
    const phoneControl = this.loginForm.get('phone');
    if (!phoneControl || phoneControl.invalid) {
      phoneControl?.markAsTouched();
      this.otpError = true;
      return;
    }

    const fullPhone =
      this.loginForm.get('countryCode')?.value.replace('+', '') +
      phoneControl?.value;

    this.otpService.sendOtp(fullPhone).subscribe({
      next: (res) => {
        console.log('OTP sent for login', res);
        this.isOtpSent = true;
        this.otpError = false;
      },
      error: (err) => {
        console.error('Error sending OTP for login', err);
        this.otpError = true;
      },
    });
  }

  verifyLoginOtp() {
    const otpControl = this.loginForm.get('otp');
    const phoneControl = this.loginForm.get('phone');

    if (!otpControl || otpControl.invalid) {
      otpControl?.markAsTouched();
      this.otpError = true;
      return;
    }

    const fullPhone =
      this.loginForm.get('countryCode')?.value.replace('+', '') +
      phoneControl?.value;

    const otpValue = otpControl.value;
    this.otpService.verifyOtp(fullPhone, otpValue).subscribe({
      next: (res) => {
        if (res.message === 'OTP verified successfully') {
          this.isPhoneVerified = true;
          this.otpError = false;
          otpControl.disable();

          this.authService.login(res.token);

          localStorage.setItem('userPhone', fullPhone);
          localStorage.setItem('authToken', res.token);

          this.loginForm.reset();
          this.closeLogin();

          // Optionally store JWT
          localStorage.setItem('authToken', res.token);
        } else {
          this.otpError = true;
          otpControl.setErrors({ invalidOtp: true });
        }
      },
      error: (err) => {
        console.error('Login OTP verification failed', err);
        this.loginForm.reset();
        this.closeLogin();
        const backendMessage =
          err.error?.message || 'An unexpected error occurred';

        if (
          backendMessage.toLowerCase().includes('no account') ||
          err.status === 404
        ) {
          this.toastr.error(
            'No account exists for this phone number.',
            'Login Error'
          );
        } else if (
          backendMessage.toLowerCase().includes('invalid otp') ||
          err.status === 400
        ) {
          this.toastr.error('Invalid OTP. Please try again.', 'OTP Error');
          otpControl.setErrors({ invalidOtp: true });
        } else {
          this.toastr.error(backendMessage, 'Server Error');
        }

        this.otpError = true;
        otpControl.setErrors({ serverError: true });
      },
    });
  }

  openLogin() {
    this.showSignupModal = false;
    this.showLoginModal = true;
  }
  openSignup() {
    this.showLoginModal = false;
    this.showSignupModal = true;
  }
  closeSignup() {
    this.showSignupModal = false;
  }
  closeLogin() {
    this.showLoginModal = false;
  }

  sendOtp() {
    const phoneControl = this.myForm.get('number');
    if (!phoneControl || phoneControl.invalid) {
      this.otpError = true;
      phoneControl?.markAsTouched();
      return;
    }

    const phoneNumber = phoneControl.value;

    this.otpService.sendOtp('91' + phoneNumber).subscribe({
      next: (res) => {
        console.log('OTP sent successfully', res);
        this.isOtpSent = true;
        this.otpError = false;
      },
      error: (err) => {
        console.error('Error sending OTP', err);
        this.otpError = true;
      },
    });
  }

  verifyOtp() {
    const otpControl = this.myForm.get('otp');
    const phoneControl = this.myForm.get('number');

    if (!otpControl || otpControl.invalid) {
      this.otpError = true;
      otpControl?.markAsTouched();
      return;
    }

    const otpValue = otpControl.value;
    const phoneValue = phoneControl?.value;

    this.otpService.verifyOnlyOtp('91' + phoneValue, otpValue).subscribe({
      next: (res) => {
        if (res.message == 'OTP verified successfully') {
          this.isPhoneVerified = true;
          this.otpError = false;
          otpControl.setErrors(null);
          otpControl.markAsUntouched();
          otpControl.disable();
        } else {
          this.otpError = true;
          otpControl.setErrors({ invalidOtp: true });
        }
      },
      error: (err) => {
        console.error('Error verifying OTP', err);
        this.otpError = true;
        otpControl.setErrors({ serverError: true });
      },
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      console.log('Form submitted: ', formData);

      this.userService.createUser(formData).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.toastr.success('Account created successfully!', 'Success');

          if (response.token) {
            this.authService.login(response.token); // Save token + set loggedIn=true
            localStorage.setItem('userEmail', formData.email); // Optional: store user info
          }

          this.myForm.reset();
          this.closeSignup();
        },
        error: (error) => {
          console.error('Error creating user:', error);

          const backendMessage =
            error.error?.message || 'An unexpected error occurred';

          if (backendMessage.toLowerCase().includes('phone')) {
            this.myForm.get('number')?.setErrors({ phoneExists: true });
            this.toastr.error(
              'This phone number is already registered.',
              'Error'
            );
            this.myForm.reset();
            this.closeSignup();
          } else if (backendMessage.toLowerCase().includes('email')) {
            this.myForm.get('email')?.setErrors({ emailExists: true });
            this.toastr.error('This email is already registered.', 'Error');
            this.myForm.reset();
            this.closeSignup();
          } else {
            this.toastr.error(backendMessage, 'Error');
          }
        },
      });
    } else {
      console.log('Form is invalid');
      this.myForm.markAllAsTouched();
    }
  }
}
