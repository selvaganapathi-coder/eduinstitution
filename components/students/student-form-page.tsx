"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Avatar, Button, Input, Select, Spin, Upload, notification } from "antd";
import type { UploadProps } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, InboxOutlined, SaveOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { ApplicationShell } from "@/components/application-shell";

type AcademicYear={id:string;name:string;status:string;isCurrent:boolean};
type Department={id:string;name:string;code:string;status:string};
type Program={id:string;name:string;code:string;department:{id:string;name:string;code:string};status:string};
type Enrollment={id:string;enrollmentNumber:string;academicYear:{id:string;name:string};department:{id:string;name:string};program:{id:string;name:string}};
type Student={id:string;studentNumber:string;firstName:string;middleName:string|null;lastName:string;email:string|null;phone:string|null;alternatePhone:string|null;photoUrl:string|null;dateOfBirth:string|null;gender:string|null;bloodGroup:string|null;nationality:string|null;religion:string|null;category:string|null;motherTongue:string|null;addressLine1:string|null;addressLine2:string|null;city:string|null;state:string|null;postalCode:string|null;country:string|null;guardianName:string|null;guardianRelation:string|null;guardianPhone:string|null;guardianEmail:string|null;admissionDate:string|null;admissionType:string|null;quota:string|null;enrollments:Enrollment[]};
type FormState={studentNumber:string;firstName:string;middleName:string;lastName:string;email:string;phone:string;alternatePhone:string;photoUrl:string;dateOfBirth:string;gender:string;bloodGroup:string;nationality:string;religion:string;category:string;motherTongue:string;addressLine1:string;addressLine2:string;city:string;state:string;postalCode:string;country:string;guardianName:string;guardianRelation:string;guardianPhone:string;guardianEmail:string;admissionDate:string;admissionType:string;quota:string;academicYearId:string;departmentId:string;programId:string;enrollmentNumber:string};
const empty:FormState={studentNumber:"",firstName:"",middleName:"",lastName:"",email:"",phone:"",alternatePhone:"",photoUrl:"",dateOfBirth:"",gender:"",bloodGroup:"",nationality:"",religion:"",category:"",motherTongue:"",addressLine1:"",addressLine2:"",city:"",state:"",postalCode:"",country:"India",guardianName:"",guardianRelation:"",guardianPhone:"",guardianEmail:"",admissionDate:"",admissionType:"",quota:"",academicYearId:"",departmentId:"",programId:"",enrollmentNumber:""};

const toDate=(value:string|null|undefined)=>value?new Date(value).toISOString().slice(0,10):"";
export function StudentFormPage({studentId}:{studentId?:string}) {
  const editing=Boolean(studentId);
  const [api,holder]=notification.useNotification();
  const [form,setForm]=useState<FormState>(empty);
  const [years,setYears]=useState<AcademicYear[]>([]);
  const [departments,setDepartments]=useState<Department[]>([]);
  const [programs,setPrograms]=useState<Program[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const notify=useCallback((type:"success"|"error"|"warning"|"info",message:string)=>api[type]({message,placement:"bottomRight",duration:4,className:`edu-notification edu-notification-${type}`}),[api]);

  useEffect(()=>{let cancelled=false;void Promise.all([
    fetch("/api/academic/years",{cache:"no-store"}),fetch("/api/academic/departments",{cache:"no-store"}),fetch("/api/academic/programs",{cache:"no-store"}),
    studentId?fetch(`/api/students/${studentId}`,{cache:"no-store"}):Promise.resolve(null)
  ]).then(async([yr,dr,pr,sr])=>{
    const [yd,dd,pd,sd]=await Promise.all([yr.json(),dr.json(),pr.json(),sr?sr.json():Promise.resolve(null)]);
    if(!yr.ok||!dr.ok||!pr.ok||sr&&!sr.ok) throw new Error(yd.error??dd.error??pd.error??sd?.error??"Unable to load student information.");
    if(cancelled)return;
    setYears((yd.academicYears??[]).filter((x:AcademicYear)=>x.status==="ACTIVE"));
    setDepartments((dd.departments??[]).filter((x:Department)=>x.status==="ACTIVE"));
    setPrograms((pd.programs??[]).filter((x:Program)=>x.status!=="ARCHIVED"));
    if(sd?.student){const s=sd.student as Student;const e=s.enrollments[0];setForm({
      studentNumber:s.studentNumber,firstName:s.firstName,middleName:s.middleName??"",lastName:s.lastName,email:s.email??"",phone:s.phone??"",alternatePhone:s.alternatePhone??"",photoUrl:s.photoUrl??"",dateOfBirth:toDate(s.dateOfBirth),gender:s.gender??"",bloodGroup:s.bloodGroup??"",nationality:s.nationality??"",religion:s.religion??"",category:s.category??"",motherTongue:s.motherTongue??"",addressLine1:s.addressLine1??"",addressLine2:s.addressLine2??"",city:s.city??"",state:s.state??"",postalCode:s.postalCode??"",country:s.country??"India",guardianName:s.guardianName??"",guardianRelation:s.guardianRelation??"",guardianPhone:s.guardianPhone??"",guardianEmail:s.guardianEmail??"",admissionDate:toDate(s.admissionDate),admissionType:s.admissionType??"",quota:s.quota??"",academicYearId:e?.academicYear.id??"",departmentId:e?.department.id??"",programId:e?.program.id??"",enrollmentNumber:e?.enrollmentNumber??""
    });} else setForm(x=>({...x,academicYearId:(yd.academicYears??[]).find((y:AcademicYear)=>y.isCurrent)?.id??(yd.academicYears??[])[0]?.id??""}));
    setLoading(false);
  }).catch((error:unknown)=>{if(!cancelled){notify("error",error instanceof Error?error.message:"Unable to load student information.");setLoading(false);}});
  return()=>{cancelled=true;};},[studentId,notify]);

  const visiblePrograms=useMemo(()=>programs.filter(p=>!form.departmentId||p.department.id===form.departmentId),[form.departmentId,programs]);
  const set=(key:keyof FormState,value:string)=>setForm(x=>({...x,[key]:value}));
  const initials=`${form.firstName[0]??""}${form.lastName[0]??""}`.toUpperCase();

  const beforeUpload:UploadProps["beforeUpload"]=(file)=>{
    const validType=["image/jpeg","image/png","image/webp"].includes(file.type);
    if(!validType){notify("error","Upload a JPG, PNG, or WEBP image.");return Upload.LIST_IGNORE;}
    if(file.size>2*1024*1024){notify("error","Student photo must be 2MB or smaller.");return Upload.LIST_IGNORE;}
    const reader=new FileReader();
    reader.onload=()=>{if(typeof reader.result==="string")set("photoUrl",reader.result);};
    reader.readAsDataURL(file);
    return false;
  };

  async function save(){
    if(!form.studentNumber||!form.firstName||!form.lastName||!form.academicYearId||!form.departmentId||!form.programId||!form.enrollmentNumber){notify("warning","Complete all required student and admission details.");return;}
    setSaving(true);
    try{
      const r=await fetch(editing?`/api/students/${studentId}`:"/api/students",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d=await r.json();if(!r.ok)throw new Error(d.error??"We couldn't save the student. Please try again.");
      sessionStorage.setItem("edu-student-flash",JSON.stringify({type:"success",message:editing?"Student updated successfully.":"Student created successfully."}));
      window.location.assign("/students");
    }catch(error){notify("error",error instanceof Error?error.message:"We couldn't save the student. Please try again.");}
    finally{setSaving(false);}
  }

  return <ApplicationShell selectedKey="students" showPageContext={false}>
    {holder}
    <div className="student-form-page">
      <header className="student-form-hero">
        <div>
          <div className="student-breadcrumb">Home <span>›</span> <Link href="/students">Students</Link> <span>›</span> <strong>{editing?"Edit Student":"Add Student"}</strong></div>
          <div className="student-form-title-row"><div className="students-title-icon"><UserAddOutlined/></div><div><h1>{editing?"Edit Student":"Add New Student"}</h1><p>{editing?"Update student profile, admission, contact, and guardian details.":"Enter student information to create a complete student profile."}</p></div></div>
        </div>
        <Link href="/students"><Button icon={<ArrowLeftOutlined/>}>Back to Students</Button></Link>
      </header>
      {loading?<div className="student-form-loading"><Spin size="large"/></div>:<div className="student-form-layout">
        <main className="student-form-main">
          <Section title="Personal Information"><div className="student-form-grid three">
            <Field label="First Name" required><Input value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="Enter first name"/></Field>
            <Field label="Middle Name"><Input value={form.middleName} onChange={e=>set("middleName",e.target.value)} placeholder="Enter middle name"/></Field>
            <Field label="Last Name" required><Input value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Enter last name"/></Field>
            <Field label="Date of Birth"><Input type="date" value={form.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)}/></Field>
            <Field label="Gender"><Select value={form.gender||undefined} allowClear onChange={v=>set("gender",v??"")} placeholder="Select gender" options={["Male","Female","Non-binary","Prefer not to say"].map(value=>({value,label:value}))}/></Field>
            <Field label="Student Number" required><Input value={form.studentNumber} onChange={e=>set("studentNumber",e.target.value)} placeholder="Example: STU-2026-001"/></Field>
            <Field label="Email Address"><Input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="Enter email address"/></Field>
            <Field label="Mobile Number"><Input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="Enter mobile number"/></Field>
            <Field label="Alternate Number"><Input value={form.alternatePhone} onChange={e=>set("alternatePhone",e.target.value)} placeholder="Enter alternate number"/></Field>
            <Field label="Blood Group"><Select value={form.bloodGroup||undefined} allowClear onChange={v=>set("bloodGroup",v??"")} placeholder="Select blood group" options={["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(value=>({value,label:value}))}/></Field>
            <Field label="Nationality"><Input value={form.nationality} onChange={e=>set("nationality",e.target.value)} placeholder="Example: Indian"/></Field>
            <Field label="Religion"><Input value={form.religion} onChange={e=>set("religion",e.target.value)} placeholder="Enter religion"/></Field>
            <Field label="Category"><Input value={form.category} onChange={e=>set("category",e.target.value)} placeholder="Example: General"/></Field>
            <Field label="Mother Tongue"><Input value={form.motherTongue} onChange={e=>set("motherTongue",e.target.value)} placeholder="Enter mother tongue"/></Field>
          </div></Section>
          <Section title="Admission Information"><div className="student-form-grid two">
            <Field label="Academic Year" required><Select value={form.academicYearId||undefined} onChange={v=>set("academicYearId",v)} options={years.map(x=>({value:x.id,label:x.name}))} placeholder="Select academic year"/></Field>
            <Field label="Department" required><Select value={form.departmentId||undefined} onChange={v=>setForm(x=>({...x,departmentId:v,programId:""}))} options={departments.map(x=>({value:x.id,label:x.name}))} placeholder="Select department"/></Field>
            <Field label="Program" required><Select value={form.programId||undefined} onChange={v=>set("programId",v)} options={visiblePrograms.map(x=>({value:x.id,label:x.name}))} placeholder="Select program"/></Field>
            <Field label="Admission Date"><Input type="date" value={form.admissionDate} onChange={e=>set("admissionDate",e.target.value)}/></Field>
            <Field label="Enrollment Number" required><Input value={form.enrollmentNumber} onChange={e=>set("enrollmentNumber",e.target.value)} placeholder="Example: ENR-2026-001"/></Field>
            <Field label="Admission Type"><Input value={form.admissionType} onChange={e=>set("admissionType",e.target.value)} placeholder="Example: Regular"/></Field>
            <Field label="Quota"><Input value={form.quota} onChange={e=>set("quota",e.target.value)} placeholder="Example: Management"/></Field>
          </div></Section>
          <Section title="Contact Information"><div className="student-form-grid two">
            <Field label="Address Line 1"><Input value={form.addressLine1} onChange={e=>set("addressLine1",e.target.value)} placeholder="Enter address line 1"/></Field>
            <Field label="Address Line 2"><Input value={form.addressLine2} onChange={e=>set("addressLine2",e.target.value)} placeholder="Enter address line 2"/></Field>
            <Field label="City"><Input value={form.city} onChange={e=>set("city",e.target.value)} placeholder="Enter city"/></Field>
            <Field label="State"><Input value={form.state} onChange={e=>set("state",e.target.value)} placeholder="Enter state"/></Field>
            <Field label="Pincode"><Input value={form.postalCode} onChange={e=>set("postalCode",e.target.value)} placeholder="Enter pincode"/></Field>
            <Field label="Country"><Input value={form.country} onChange={e=>set("country",e.target.value)} placeholder="India"/></Field>
          </div></Section>
        </main>
        <aside className="student-form-side">
          <section className="student-photo-panel"><h2>Student Photo</h2><div className="student-photo-card">
            <Avatar size={112} src={form.photoUrl||undefined} icon={!form.photoUrl?<UserOutlined/>:undefined}>{!form.photoUrl?initials:null}</Avatar>
            <strong>{form.photoUrl?"Photo selected":"Upload Photo"}</strong><span>JPG, PNG, or WEBP up to 2MB</span>
            <Upload accept="image/jpeg,image/png,image/webp" maxCount={1} showUploadList={false} beforeUpload={beforeUpload}><Button icon={<InboxOutlined/>}>Choose File</Button></Upload>
            {form.photoUrl&&<Button danger type="text" icon={<DeleteOutlined/>} onClick={()=>set("photoUrl","")}>Remove Photo</Button>}
          </div></section>
          <section className="student-photo-panel"><h2>Parent / Guardian Information</h2><div className="student-side-fields">
            <Field label="Parent / Guardian Name"><Input value={form.guardianName} onChange={e=>set("guardianName",e.target.value)} placeholder="Enter parent/guardian name"/></Field>
            <Field label="Relation"><Input value={form.guardianRelation} onChange={e=>set("guardianRelation",e.target.value)} placeholder="Example: Father"/></Field>
            <Field label="Parent Mobile Number"><Input value={form.guardianPhone} onChange={e=>set("guardianPhone",e.target.value)} placeholder="Enter mobile number"/></Field>
            <Field label="Parent Email"><Input value={form.guardianEmail} onChange={e=>set("guardianEmail",e.target.value)} placeholder="Enter email address"/></Field>
          </div></section>
        </aside>
      </div>}
      <div className="student-form-actions"><Button onClick={()=>setForm(empty)}>Reset</Button><Button type="primary" icon={editing?<SaveOutlined/>:<UserAddOutlined/>} loading={saving} onClick={()=>void save()}>{editing?"Save Changes":"Save Student"}</Button></div>
    </div>
  </ApplicationShell>;
}
function Section({title,children}:{title:string;children:ReactNode}){return <section className="student-form-section"><h2><span/>{title}</h2>{children}</section>;}
function Field({label,required,children}:{label:string;required?:boolean;children:ReactNode}){return <label className="student-field"><span>{label}{required&&<b> *</b>}</span>{children}</label>;}