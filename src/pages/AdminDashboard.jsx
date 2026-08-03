import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axios";
import { FaCircle } from "react-icons/fa";

export default function AdminDashboard() {

  const [data, setData] = useState([]);

  useEffect(() => {

    const load = async () => {
      const res = await axiosInstance.get("/admin/dashboard");
      setData(res.data);
    };

    load();

  }, []);

  return (
    <div className="max-w-5xl space-y-5">

      <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>

      {data.map((item, i) => (

        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <h2 className="text-gray-800 font-medium">{item.className}</h2>
          <p className="text-gray-500 text-sm">Teacher: {item.teacher}</p>
          <p className="text-gray-500 text-sm">Subject: {item.subject}</p>
          <p className="text-gray-500 text-sm">Date: {item.date}</p>

          <div className="mt-3 space-y-2">

            {item.students.map((s, idx) => (

              <div key={idx} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">

                <span className="text-gray-700 text-sm">
                  {s.firstName} {s.lastName}
                </span>

                <span className="flex items-center gap-1">
                  {s.status === "present" && <><FaCircle className="text-emerald-500 text-[8px]" /> <span className="text-emerald-600 text-sm">present</span></>}
                  {s.status === "absent" && <><FaCircle className="text-red-500 text-[8px]" /> <span className="text-red-600 text-sm">absent</span></>}
                  {s.status === "late" && <><FaCircle className="text-amber-500 text-[8px]" /> <span className="text-amber-600 text-sm">late</span></>}
                </span>

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>
  );
}
