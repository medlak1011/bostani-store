import OrderForm from "../components/OrderForm";
import StickyCta from "../components/StickyCta";
import { PRICES, PRODUCT } from "../lib/product";

const BENEFITS = [
  ["⚔", "شفرة من الفولاذ المقوى"],
  ["⚡", "كيقطع الغصون الغليظة فثواني"],
  ["▲", "سنان حادين مزدوجين"],
  ["✋", "يد مريحة ما كتزلقش من اليد"],
  ["⤾", "كيتطوى وكيتسد بأمان"],
];

const USES = [
  ["🫒", "تقليم الزيتون"],
  ["🍊", "الأشجار المثمرة"],
  ["🔥", "الحطب فالتخييم"],
  ["🪵", "خدمة الخشب"],
];

const FAQ = [
  ["كيفاش كنخلص؟", "كتخلص غير ملي يوصلك المنشار لليد ديالك. ما كتخلص والو قبل."],
  ["واش كيتطوى؟", "إيه. الشفرة كتدخل وسط اليد وكتسد بالزر، والسنان كيبقاو مخبيين. كتهزو فالصاك بلا خوف."],
  ["واش كيقطع الغصون الغليظة؟", "إيه. الشفرة من الفولاذ المقوى والسنان حادين ومزدوجين، كيقطع الغصون الغليظة فثواني."],
  ["كيفاش كنعرف أن الطلبية تسجلات؟", "من بعد ما تعمر الورقة، غادي نعيطو ليك فالتيليفون باش نأكدو معاك. خلي التيليفون مشعول."],
];

export default function Page() {
  return (
    <>
      <div className="topbar">💵 الدفع عند الاستلام · التوصيل لجميع المدن</div>
      <div className="brand">بستاني <small>BOSTANI</small></div>

      <section className="hero">
        <div className="wrap">
          <div className="hero-img"><img src="/images/hero.jpg" alt={PRODUCT.name} width="768" height="960" fetchPriority="high" /></div>
          <h1>منشار التقليم اللي كيقطع الغصون فثواني</h1>
          <p className="sub">قوي، حاد، وكيتطوى فاليد. ساهل فالخدمة ديال الزيتون والأشجار.</p>
          <div className="pricebox">
            <div className="p">{PRICES.unit} <small>درهم</small></div>
            <div className="cod">كتخلص<br />ملي يوصلك</div>
          </div>
          <a href="#order" className="btn">اطلب دابا 👈</a>
          <ul className="trust">
            <li><span>💵</span>الدفع عند الاستلام</li>
            <li><span>🚚</span>التوصيل لباب الدار</li>
          </ul>
        </div>
      </section>

      <section className="sec dark">
        <div className="wrap">
          <h2 className="h2">علاش هاد المنشار؟</h2>
          <ul className="benefits">
            {BENEFITS.map(([i, t]) => <li key={t}><i aria-hidden="true">{i}</i>{t}</li>)}
          </ul>
        </div>
      </section>

      <section className="sec white">
        <div className="wrap">
          <h2 className="h2">شوف كيفاش كيقطع</h2>
          <div className="photo"><img src="/images/cut.jpg" alt="المنشار كيقطع غصن ديال الزيتون" loading="lazy" width="768" height="1376" /></div>
          <p className="caption">غصن غليظ؟ جوج ولا ثلاث جرات وطاح.</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2 className="h2">المنشار القديم ولا هادا؟</h2>
          <div className="photo"><img src="/images/compare.jpg" alt="منشار قديم مقابل منشار التقليم الجديد" loading="lazy" width="768" height="1376" /></div>
          <p className="caption muted">على اليمين: الشفرة الحادة كتقطع نقي وبلا تعب.</p>
        </div>
      </section>

      <section className="sec white">
        <div className="wrap">
          <h2 className="h2">كيتطوى وكيدخل فالصاك</h2>
          <div className="photo"><img src="/images/fold.jpg" alt="المنشار مطوي" loading="lazy" width="768" height="1376" /></div>
          <p className="caption">السنان كيتخباو وسط اليد. آمن عليك وعلى الدراري.</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2 className="h2">فين كتخدم بيه؟</h2>
          <ul className="uses">{USES.map(([i, t]) => <li key={t}><span>{i}</span>{t}</li>)}</ul>
          <div className="photo" style={{ marginTop: 18 }}><img src="/images/product.jpg" alt={PRODUCT.name} loading="lazy" width="900" height="900" /></div>
        </div>
      </section>

      <section className="sec white">
        <div className="wrap">
          <h2 className="h2">كيفاش تطلب؟ ساهلة</h2>
          <ol className="steps">
            <li>كتب سميتك والنمرة ديالك لتحت</li>
            <li>غادي نعيطو ليك باش نأكدو</li>
            <li>كيوصلك المنشار وكتخلص فالبلاصة</li>
          </ol>
        </div>
      </section>

      <section className="sec" id="order">
        <div className="wrap"><OrderForm /></div>
      </section>

      <section className="sec white faq">
        <div className="wrap">
          <h2 className="h2">أسئلة</h2>
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          <a href="#order" className="btn" style={{ marginTop: 18 }}>اطلب دابا 👈</a>
        </div>
      </section>

      <footer className="foot">© بستاني · BOSTANI — المغرب 🇲🇦</footer>
      <StickyCta price={PRICES.unit} />
    </>
  );
}
