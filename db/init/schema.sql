--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability (
    id integer NOT NULL,
    doctorid integer NOT NULL,
    available boolean NOT NULL,
    start date NOT NULL,
    "end" date NOT NULL
);


--
-- Name: chat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat (
    id integer NOT NULL,
    patientid integer NOT NULL,
    doctorid integer NOT NULL,
    createddate date NOT NULL,
    clientid integer,
    created_date timestamp(6) without time zone
);


--
-- Name: consult; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consult (
    id integer NOT NULL,
    link character varying(255) NOT NULL,
    startdate date NOT NULL,
    doctorid integer NOT NULL,
    patientid integer NOT NULL,
    date_start date
);


--
-- Name: doctor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    specialization character varying(150) NOT NULL,
    photourl character varying(255)
);


--
-- Name: drug; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drug (
    id integer NOT NULL,
    doctorid integer NOT NULL,
    patientid integer NOT NULL,
    name character varying(255) NOT NULL,
    dosage character varying(255) NOT NULL,
    notes character varying(255),
    active boolean NOT NULL,
    prescriptionfileurl character varying(255),
    dateprescribed date NOT NULL
);


--
-- Name: exam; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam (
    id integer NOT NULL,
    patientid integer NOT NULL,
    doctorid integer NOT NULL,
    name character varying(255),
    dateprescribed date,
    fileurl character varying(255),
    status integer NOT NULL,
    date_prescribed date,
    type character varying(255) DEFAULT ''::character varying NOT NULL
);


--
-- Name: exam_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exam_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exam_id_seq OWNED BY public.exam.id;


--
-- Name: message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message (
    id integer NOT NULL,
    senderid integer NOT NULL,
    chatid integer NOT NULL,
    content character varying(255) NOT NULL
);


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    type integer NOT NULL,
    title character varying(50) NOT NULL,
    description character varying(255),
    date date NOT NULL,
    seen boolean NOT NULL,
    userid integer NOT NULL
);


--
-- Name: patient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient (
    id integer NOT NULL,
    doctorid integer NOT NULL,
    name character varying(150) NOT NULL,
    photourl character varying(255),
    gender boolean NOT NULL,
    phonenumber integer,
    address character varying(255),
    age smallint NOT NULL,
    height smallint,
    weight smallint NOT NULL,
    vacinesbookurl character varying(255)
);


--
-- Name: seq_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seq_user (
    next_hi integer
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    passhash character varying(255) NOT NULL,
    type character varying(31) NOT NULL,
    pass_hash character varying(255),
    name character varying(150),
    photo_url character varying(255),
    specialization character varying(150),
    address character varying(255),
    age integer,
    gender boolean,
    height integer,
    phone_number character varying(255),
    vaccinesbookurl character varying(255),
    weight integer,
    doctorid integer
);


--
-- Name: exam id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam ALTER COLUMN id SET DEFAULT nextval('public.exam_id_seq'::regclass);


--
-- Name: users User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: availability availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_pkey PRIMARY KEY (id);


--
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- Name: consult consult_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consult
    ADD CONSTRAINT consult_pkey PRIMARY KEY (id);


--
-- Name: doctor doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT doctor_pkey PRIMARY KEY (id);


--
-- Name: drug drug_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drug
    ADD CONSTRAINT drug_pkey PRIMARY KEY (id);


--
-- Name: exam exam_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT exam_pkey PRIMARY KEY (id);


--
-- Name: message message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (id);


--
-- Name: chat fk278sfcslu25yy9adjv830mo6y; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT fk278sfcslu25yy9adjv830mo6y FOREIGN KEY (doctorid) REFERENCES public.users(id);


--
-- Name: users fk7ffrg9ogohrcm5t6mgrohs2r5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk7ffrg9ogohrcm5t6mgrohs2r5 FOREIGN KEY (doctorid) REFERENCES public.users(id);


--
-- Name: availability fk7mv02uv1nyd7vo0liip02s9b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT fk7mv02uv1nyd7vo0liip02s9b2 FOREIGN KEY (doctorid) REFERENCES public.users(id);


--
-- Name: availability fkavailabili126555; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT fkavailabili126555 FOREIGN KEY (doctorid) REFERENCES public.doctor(id);


--
-- Name: chat fkchat639575; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT fkchat639575 FOREIGN KEY (doctorid) REFERENCES public.doctor(id);


--
-- Name: chat fkchat752043; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT fkchat752043 FOREIGN KEY (patientid) REFERENCES public.patient(id);


--
-- Name: consult fkconsult146577; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consult
    ADD CONSTRAINT fkconsult146577 FOREIGN KEY (patientid) REFERENCES public.patient(id);


--
-- Name: consult fkconsult433394; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consult
    ADD CONSTRAINT fkconsult433394 FOREIGN KEY (doctorid) REFERENCES public.doctor(id);


--
-- Name: doctor fkdoctor12199; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT fkdoctor12199 FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: drug fkdrug599567; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drug
    ADD CONSTRAINT fkdrug599567 FOREIGN KEY (doctorid) REFERENCES public.doctor(id);


--
-- Name: drug fkdrug792051; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drug
    ADD CONSTRAINT fkdrug792051 FOREIGN KEY (patientid) REFERENCES public.patient(id);


--
-- Name: exam fkexam564624; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT fkexam564624 FOREIGN KEY (doctorid) REFERENCES public.doctor(id);


--
-- Name: exam fkexam826994; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT fkexam826994 FOREIGN KEY (patientid) REFERENCES public.patient(id);


--
-- Name: drug fkfrxel2bnkuhyo9b1thhom8yhq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drug
    ADD CONSTRAINT fkfrxel2bnkuhyo9b1thhom8yhq FOREIGN KEY (doctorid) REFERENCES public.users(id);


--
-- Name: exam fkik5r7h6dgk7ncoip68plml7px; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT fkik5r7h6dgk7ncoip68plml7px FOREIGN KEY (patientid) REFERENCES public.users(id);


--
-- Name: exam fkkc660usjfb7q35dbpx3j18wsv; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT fkkc660usjfb7q35dbpx3j18wsv FOREIGN KEY (doctorid) REFERENCES public.users(id);


--
-- Name: drug fkkc83gbr9bjiy4gb8eut1goai4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drug
    ADD CONSTRAINT fkkc83gbr9bjiy4gb8eut1goai4 FOREIGN KEY (patientid) REFERENCES public.users(id);


--
-- Name: consult fkkwctyuuirqxjvfr4buhpy9614; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consult
    ADD CONSTRAINT fkkwctyuuirqxjvfr4buhpy9614 FOREIGN KEY (doctorid) REFERENCES public.users(id);


--
-- Name: message fkmessage51417; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT fkmessage51417 FOREIGN KEY (chatid) REFERENCES public.chat(id);


--
-- Name: notification fknotificati827346; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fknotificati827346 FOREIGN KEY (userid) REFERENCES public.users(id);


--
-- Name: patient fkpatient502595; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT fkpatient502595 FOREIGN KEY (doctorid) REFERENCES public.doctor(id);


--
-- Name: patient fkpatient888753; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT fkpatient888753 FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: consult fkr27spw7idlf0m3krfvu204rho; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consult
    ADD CONSTRAINT fkr27spw7idlf0m3krfvu204rho FOREIGN KEY (patientid) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

