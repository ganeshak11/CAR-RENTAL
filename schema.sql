-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  car_id uuid NOT NULL,
  customer_name character varying NOT NULL,
  customer_email character varying NOT NULL,
  customer_age integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL,
  total_amount numeric NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT bookings_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id)
);
CREATE TABLE public.cars (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  car_reg_no character varying NOT NULL UNIQUE,
  model character varying NOT NULL,
  category character varying NOT NULL,
  color character varying NOT NULL,
  price_per_day numeric NOT NULL,
  fuel_type character varying NOT NULL,
  transmission character varying NOT NULL,
  seats integer NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cars_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  document_url text NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_documents_pkey PRIMARY KEY (id),
  CONSTRAINT user_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name character varying NOT NULL,
  phone character varying,
  role character varying DEFAULT 'user'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verification_status character varying DEFAULT 'pending'::character varying,
  documents_submitted_at timestamp with time zone,
  verified_at timestamp with time zone,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);