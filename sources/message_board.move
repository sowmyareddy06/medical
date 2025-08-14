module medical_records_addr::medical_records {

    use std::signer;
    use std::string;
    use std::vector;
    use std::error;
    use aptos_std::table;

    /// Roles
    const PATIENT: u8 = 1;
    const DOCTOR: u8 = 2;

    /// Struct to store encrypted medical report
    struct MedicalReport has store, copy, drop {
        report_hash: string::String,
        emergency_flag: bool,
    }

    /// Struct to store user profile
    struct UserProfile has store {
        role: u8,
        reports: vector<MedicalReport>,
        authorized_doctors: vector<address>, // Doctors allowed to view
    }

    /// Resource to store all users
    struct Registry has key {
        users: table::Table<address, UserProfile>,
        verified_doctors: table::Table<address, bool>, // Government-verified doctors
    }

    /// Initialize registry
    public entry fun init_registry(admin: &signer) {
        move_to(admin, Registry {
            users: table::new<address, UserProfile>(),
            verified_doctors: table::new<address, bool>(),
        });
    }

    /// Register patient
    public entry fun register_patient(user: &signer) acquires Registry {
        let addr = signer::address_of(user);
        let registry = borrow_global_mut<Registry>(addr);
        let profile = UserProfile {
            role: PATIENT,
            reports: vector::empty<MedicalReport>(),
            authorized_doctors: vector::empty<address>(),
        };
        table::add(&mut registry.users, addr, profile);
    }

    /// Register doctor (must be verified externally)
    public entry fun register_doctor(admin: &signer, doctor: address) acquires Registry {
        let registry = borrow_global_mut<Registry>(signer::address_of(admin));
        table::add(&mut registry.verified_doctors, doctor, true);
    }

    /// Upload medical report
    public entry fun upload_report(user: &signer, report_hash: string::String, emergency_flag: bool) acquires Registry {
        let addr = signer::address_of(user);
        let registry = borrow_global_mut<Registry>(addr);
        let profile = table::borrow_mut(&mut registry.users, addr);
        let report = MedicalReport {
            report_hash,
            emergency_flag,
        };
        vector::push_back(&mut profile.reports, report);
    }

    /// Grant doctor access
    public entry fun authorize_doctor(user: &signer, doctor: address) acquires Registry {
        let addr = signer::address_of(user);
        let registry = borrow_global_mut<Registry>(addr);
        let profile = table::borrow_mut(&mut registry.users, addr);
        vector::push_back(&mut profile.authorized_doctors, doctor);
    }

    /// View reports (doctor access)
    public fun view_reports(doctor: &signer, patient: address): vector<MedicalReport> acquires Registry {
        let registry = borrow_global<Registry>(patient);
        let is_verified = table::borrow(&registry.verified_doctors, signer::address_of(doctor));
        assert!(*is_verified, error::invalid_argument(1));

        let profile = table::borrow(&registry.users, patient);
        let doctor_address = signer::address_of(doctor);
        let authorized = vector::contains(&profile.authorized_doctors, &doctor_address);
        assert!(authorized, error::invalid_argument(2));

        profile.reports
    }

    /// Emergency access (only if emergency_flag is true)
    public fun emergency_access(doctor: &signer, patient: address): vector<MedicalReport> acquires Registry {
        let registry = borrow_global<Registry>(patient);
        let is_verified = table::borrow(&registry.verified_doctors, signer::address_of(doctor));
        assert!(*is_verified, error::invalid_argument(3));

        let profile = table::borrow(&registry.users, patient);
        let emergency_reports = vector::empty<MedicalReport>();
        let all_reports = &profile.reports;

        let len = vector::length(all_reports);
        let i = 0;
        while (i < len) {
            let report = vector::borrow(all_reports, i);
            if (report.emergency_flag) {
                vector::push_back(&mut emergency_reports, *report);
            };
            i = i + 1;
        };

        emergency_reports
    }
}
