import { useState } from 'react';

const faqs = [
  { 
    question: 'What is BloodBridge?', 
    answer: 'BloodBridge is India\'s most advanced emergency blood logistics network. We connect donors, hospitals, and recipients in real-time using intelligent routing and live availability tracking.' 
  },
  { 
    question: 'How do I request blood?', 
    answer: 'Simply log in, click on "Request Blood", and fill in the patient details. Our system will immediately notify all matching donors within a 50km radius and provide you with a list of nearby hospitals with verified inventory.' 
  },
  { 
    question: 'Is my contact information private?', 
    answer: 'Absolutely. We take privacy seriously. Your contact number is only revealed to a donor once they accept your request. Similarly, donor details are only shared with the requester to ensure safe coordination.' 
  },
  { 
    question: 'Who can donate blood?', 
    answer: 'Any healthy adult between 18-65 years weighing at least 45kg can donate. You should not have any chronic illnesses or recent infections. Check our "Guides" section for a detailed eligibility checklist.' 
  },
  { 
    question: 'How often can I donate?', 
    answer: 'Men can donate every 3 months (90 days), and women can donate every 4 months (120 days). This ensures your body has enough time to replenish iron levels.' 
  },
  { 
    question: 'What is a Reliability Score?', 
    answer: 'The Reliability Score is a unique BloodBridge feature that rewards donors for being responsive. Successfully fulfilling a request increases your score, helping build trust within the community.' 
  },
];

const supportMailto =
  'mailto:bloodbridgeappln@gmail.com?subject=BloodBridge%20Support%20Request&body=Hi%20BloodBridge%20Support%2C%0A%0AI%20need%20help%20with%3A%0A%0A';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Got Questions?</h1>
        <p className="text-xl text-slate-500 font-medium">Everything you need to know about the BloodBridge ecosystem.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`group rounded-[2rem] border transition-all duration-300 ${
              openIndex === index ? 'bg-white border-red-100 shadow-xl' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
            }`}
          >
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-8 py-7 flex items-center justify-between gap-4"
            >
              <span className={`text-lg font-bold transition-colors ${openIndex === index ? 'text-red-600' : 'text-slate-900'}`}>
                {faq.question}
              </span>
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === index ? 'bg-red-600 text-white rotate-180' : 'bg-slate-200 text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-8 pb-8 text-slate-600 leading-relaxed font-medium">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[2.5rem] bg-slate-900 p-12 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Our support team is available 24/7 for emergency assistance and technical support.</p>
        <a href={supportMailto} className="inline-flex px-8 py-4 bg-red-600 rounded-2xl font-bold hover:bg-red-700 transition-colors">
          Contact Support
        </a>
      </div>
    </section>
  );
}

export default FAQ;
