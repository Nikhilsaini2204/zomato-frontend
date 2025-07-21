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
import { jwtDecode } from 'jwt-decode';

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
    public router: Router,
    private toastr: ToastrService,
    private httpClient: HttpClient,
    private eRef: ElementRef
  ) {}

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
  addRestaurantForm!: FormGroup;
  showAddRest = false;
  userPhoneNumber: string = '';
  userRole: string = '';
  userId:string = '';

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;

    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.userRole = decodedToken.role;

      this.userService.getUserProfile().subscribe({
        next: (profile) => {
          this.userRole = profile.role;
          this.userId = profile.id;
          console.log('Fetched user role:', this.userId);
        },
        error: (err) => {
          console.error('Failed to load profile', err);
        },
      });
    }

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

    this.addRestaurantForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      typeCuisine: ['', Validators.required],
      address: ['', Validators.required],
      openingHour: ['', Validators.required],
      closingHour: ['', Validators.required],
      time: ['', Validators.required],
      imageUrl: ['', [Validators.required]],
    });

    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.userPhoneNumber = profile.number;
        this.userRole = profile.role;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
      },
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
      complete: () => {},
    });
  }

  openAddRest() {
    this.showAddRest = true;
  }

  closeAddRest() {
    this.showAddRest = false;
  }

  submitRestaurant() {
    if (this.addRestaurantForm.valid) {
      const restaurantData = this.addRestaurantForm.value;
      restaurantData.phoneNumber = this.userPhoneNumber;
      restaurantData.ownerId = this.userId;

      const payload = {
        name: restaurantData.name,
        typeCuisine: restaurantData.typeCuisine,
        ownerId: restaurantData.ownerId,
        openingHour: restaurantData.openingHour,
        closingHour: restaurantData.closingHour,
        phoneNumber: restaurantData.phoneNumber,
        address: [restaurantData.address],
        restaurantImage: restaurantData.imageUrl,
        time: restaurantData.time,
      };
      console.log('Payload being sent:', payload);

      this.userService.addRestaurant(payload).subscribe({
        next: (res) => {
          this.toastr.success('Restaurant added successfully!', 'Success');
          this.closeAddRest();
          this.addRestaurantForm.reset();
        },
        error: (err) => {
          console.error('Failed to add restaurant', err);
          this.toastr.error('Failed to add restaurant', 'Error');
        },
      });
    } else {
      console.warn('Form Invalid');
      this.addRestaurantForm.markAllAsTouched();
    }
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
      this.searchResults = { restaurants: [], dishes: [] };
    }
  }

  goToProfile(): void {
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
          window.location.reload();

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
          window.location.reload();
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
