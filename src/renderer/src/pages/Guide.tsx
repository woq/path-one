import React from 'react'

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="fx-panel rounded-2xl p-6 space-y-3 select-text">
    <h2 className="text-lg font-medium text-fx-text">{title}</h2>
    <div className="text-sm text-fx-muted leading-relaxed space-y-3">{children}</div>
  </section>
)

export const Guide: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.2em] uppercase text-fx-muted/70">使用说明</p>
        <h1 className="text-3xl font-semibold text-fx-text tracking-tight">按顺序做，不要跳步</h1>
        <p className="text-sm text-fx-muted">
          给完全不懂技术的人看。你只需要会三件事：安装打开 → 填三个空 → 打开「浏览器模式」。
        </p>
      </header>

      <Section title="先记住这几句">
        <ol className="list-decimal pl-5 space-y-2">
          <li>只运行 Path One 程序本身，不要随便改安装目录里的文件。</li>
          <li>程序开着才有效；完全退出后线路就断了。</li>
          <li>
            你要填的只有三项：<strong className="text-fx-text">端口、账号、密码</strong>
            。服务器地址和协议已经写死，没有「节点列表」。
          </li>
          <li>凭据是发给你个人的，不要发给别人，也不要用别人的。</li>
        </ol>
      </Section>

      <Section title="1. 这是干什么的">
        <p>
          Path One 是一个很小的 Windows 小工具。打开之后，符合条件的访问会走一条已经配好的线路。国内常见网站和{' '}
          <code className="text-fx-accent">10.x</code> / <code className="text-fx-accent">192.168.x</code>{' '}
          这类本地网段会尽量直连。
        </p>
        <p>你不用自己选节点，不用改服务器地址，也不用懂协议细节。</p>
      </Section>

      <Section title="2. 你会拿到什么">
        <p>开通后你会收到一段文字通知。里面至少有这三项（每个人不同）：</p>
        <pre className="rounded-xl bg-fx-bg p-4 text-xs font-mono text-fx-text overflow-x-auto">{`端口：一串数字
账号：一串字母数字
密码：一串字符`}</pre>
        <p>通知里如果还写了「地址」「协议」：Path One 里都不用管。地址固定，协议固定 SOCKS5。只填端口、账号、密码。</p>
      </Section>

      <Section title="3. 第一次怎么填">
        <ol className="list-decimal pl-5 space-y-2">
          <li>打开 Path One，停在首页。</li>
          <li>把通知里的端口、账号、密码三项粘贴进去。</li>
          <li>点「保存账号」。看到已保存，再去开开关。</li>
          <li>日常上网：打开「浏览器模式」。</li>
          <li>要用 Git / 命令行：需要「全局模式」，并且系统服务已在运行（见下方）。</li>
        </ol>
      </Section>

      <Section title="4. 怎么确认已经通了">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            （可选）打开前先访问 <code className="text-fx-accent">https://ip-api.com</code>，记下 Country。
          </li>
          <li>打开浏览器模式后，再刷新同一页面。</li>
          <li>页面上的国家/地区应和开通说明一致；若完全没变，说明还没通。</li>
          <li>备用检测页：ip.sb、ifconfig.me。只认「地区是否和说明一致」，不必核对 IP 数字。</li>
          <li>国内站和本地系统应仍能打开。若网页全部打不开：点首页「救急：关系统代理」。</li>
        </ol>
      </Section>

      <Section title="5. 两种模式">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-fx-text">浏览器模式</strong>
            ：打开系统代理。适合网页。模式开着时 Git / 很多命令行不通是正常的。
          </li>
          <li>
            <strong className="text-fx-text">全局模式</strong>
            ：TUN。需要本机已安装并运行 Path One 系统服务后才能打开。装服务时会弹出管理员确认，请点「是」。
          </li>
        </ul>
      </Section>

      <Section title="6. 救急与重置">
        <ul className="list-disc pl-5 space-y-2">
          <li>网页突然全挂：点「救急：关系统代理」。</li>
          <li>内核异常：点「重启内核」。</li>
          <li>账号填错：改三项再点「保存账号」。</li>
          <li>不要同时开着别的同类代理软件，容易抢端口。</li>
        </ul>
      </Section>

      <Section title="7. 常见问题">
        <p>
          <strong className="text-fx-text">Q：要不要填服务器 IP？</strong>
          <br />
          A：不要。已经固定，界面也不会问你。
        </p>
        <p>
          <strong className="text-fx-text">Q：要不要选节点？</strong>
          <br />
          A：不要。没有节点列表。
        </p>
        <p>
          <strong className="text-fx-text">Q：模式 1 下 Git 不行？</strong>
          <br />
          A：正常。改用全局模式（并先让系统服务跑起来）。
        </p>
        <p>
          <strong className="text-fx-text">Q：杀毒拦截？</strong>
          <br />
          A：选允许 / 信任后重新打开。
        </p>
      </Section>

      <Section title="8. 求助时请带上">
        <ol className="list-decimal pl-5 space-y-1">
          <li>开通通知截图（可打码密码中间几位）</li>
          <li>Path One 窗口截图</li>
          <li>检测页截图</li>
          <li>你开的是浏览器模式还是全局模式</li>
        </ol>
      </Section>
    </div>
  )
}
