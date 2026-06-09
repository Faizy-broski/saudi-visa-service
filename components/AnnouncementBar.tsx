export default function AnnouncementBar() {
  return (
    <div
      className="text-white py-2 px-6 text-xs flex justify-between items-center"
      style={{ background: "linear-gradient(to right, #3CA5D4, #0E3254)" }}
    >
      <div className="flex gap-5">
        <span>info@saudivisaservice.com</span>
        <span>+44 20 1234 5678</span>
      </div>
      <div className="flex gap-5">
        <a className="hover:underline opacity-80" href="#">
          Accessibility
        </a>
        <a className="hover:underline opacity-80" href="#">
          English
        </a>
      </div>
    </div>
  );
}
