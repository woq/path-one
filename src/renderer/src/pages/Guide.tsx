import React from 'react'
import { DEFAULT_MIXED_PORT, FIXED_LINE_SERVER, FIXED_LINE_TYPE } from '../../../shared/path-line'

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="fx-panel rounded-2xl p-6 space-y-3 select-text">
    <h2 className="text-lg font-medium text-fx-text">{title}</h2>
    <div className="text-sm text-fx-muted leading-relaxed space-y-3">{children}</div>
  </section>
)

const Card: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
  <div className="rounded-xl bg-fx-bg/70 px-4 py-3 space-y-2">
    <h3 className="text-sm font-medium text-fx-text">{name}</h3>
    <div className="text-xs text-fx-muted leading-relaxed space-y-2">{children}</div>
  </div>
)

export const Guide: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.2em] uppercase text-fx-muted/70">使用说明</p>
        <h1 className="text-3xl font-semibold text-fx-text tracking-tight">按页面与卡片对照操作</h1>
        <p className="text-sm text-fx-muted">
          服务器 {FIXED_LINE_SERVER} · 协议 {FIXED_LINE_TYPE.toUpperCase()} · 本地混合端口{' '}
          {DEFAULT_MIXED_PORT}
        </p>
      </header>

      <Section title="开始之前">
        <ol className="list-decimal pl-5 space-y-2">
          <li>解压发放包后，双击 <code className="text-fx-accent">path-one.exe</code>。</li>
          <li>杀毒拦截时选择允许或信任。</li>
          <li>程序保持运行时线路才有效；可最小化。</li>
          <li>开通通知里的端口、账号、密码用于首页「账号」卡片。</li>
        </ol>
      </Section>

      <Section title="侧栏">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-fx-text">首页</strong>：填写账号、开关浏览器/全局模式、查看内核状态。
          </li>
          <li>
            <strong className="text-fx-text">路由分流</strong>：查看固定直连、编辑自定义规则、查看兜底。
          </li>
          <li>
            <strong className="text-fx-text">使用说明</strong>：本页。
          </li>
          <li>
            <strong className="text-fx-text">系统服务</strong>：安装/启动 Windows 服务，供全局模式使用。
          </li>
          <li>
            <strong className="text-fx-text">内核日志</strong>：查看运行日志，便于排查。
          </li>
        </ul>
      </Section>

      <Section title="首页 · 各卡片">
        <Card name="账号">
          <p>输入开通通知中的端口、账号、密码，点「保存账号」。</p>
          <p>服务器与协议已写在程序内。保存成功后，下方模式开关才可正常打开。</p>
          <p>「使用说明」按钮会跳到本页。</p>
        </Card>
        <Card name="浏览器模式">
          <p>打开后，Windows 系统代理指向 127.0.0.1:{DEFAULT_MIXED_PORT}。</p>
          <p>浏览器等会跟随系统代理的程序将走线路。适合日常网页。</p>
          <p>开关旁有状态；若未保存账号就打开，会提示先保存。</p>
        </Card>
        <Card name="全局模式">
          <p>打开 TUN，让 Git、命令行等也走线路。</p>
          <p>依赖「系统服务」页中服务处于运行。服务未运行时打开会提示先去安装/启动。</p>
        </Card>
        <Card name="内核状态与操作">
          <p>显示内核是否运行、账号是否已保存、本地端口号。</p>
          <p>
            <strong className="text-fx-text">重启内核</strong>：重新拉起内核进程。
          </p>
          <p>
            <strong className="text-fx-text">救急：关系统代理</strong>
            ：网页突然全挂时，先点这里关闭系统代理。
          </p>
        </Card>
      </Section>

      <Section title="路由分流 · 各卡片">
        <Card name="直连规则（固定）">
          <p>本地网段（10/172/192/127）、私网与国内 IP 始终直连。</p>
          <p>此表只读，不可编辑、不可删除、不可关闭。</p>
        </Card>
        <Card name="自定义规则">
          <p>插在「直连」与「兜底」之间，自上而下匹配。</p>
          <p>可添加域名后缀、关键词、IP 网段、进程名、GeoSite、GeoIP 等。</p>
          <p>目标可选：线路 (PROXY)、直连 (DIRECT)、拦截 (REJECT)。</p>
          <p>可拖动手柄排序、启用/关闭、删除。修改后约 0.4 秒自动保存并热重载。</p>
        </Card>
        <Card name="兜底规则（固定）">
          <p>类型 MATCH，目标 PROXY：上面都未命中的流量走线路。</p>
          <p>此条固定，不可改。</p>
        </Card>
      </Section>

      <Section title="系统服务 · 用途与卡片">
        <p>全局模式需要服务在运行。本页用于安装、启动、停止服务，以及网络救急工具。</p>
        <Card name="服务状态与安装">
          <p>查看 PathOneService 是否已安装、是否运行。按按钮安装或启动；首次会弹出管理员确认，请点「是」。</p>
        </Card>
        <Card name="内核管理">
          <p>可结束本机内核进程，或结束后再启动本程序内核。操作前请确认提示框内容。</p>
        </Card>
        <Card name="网络修复">
          <p>提供刷新 DNS、重置 Winsock、修复防火墙规则等。按页面说明操作；部分步骤需重启电脑才生效。</p>
        </Card>
      </Section>

      <Section title="内核日志">
        <p>实时或历史内核输出。可按类别筛选、搜索。</p>
        <p>日常可忽略；网页不通、开关异常时，把关键日志截图发给协助者。</p>
      </Section>

      <Section title="确认是否已通">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            （可选）打开前访问 <code className="text-fx-accent">https://ip-api.com</code>，记下 Country。
          </li>
          <li>首页保存账号并打开「浏览器模式」。</li>
          <li>刷新检测页，国家/地区应与开通说明一致。</li>
          <li>备用：ip.sb、ifconfig.me。</li>
          <li>国内站与本地系统应仍可访问。若网页全挂：点「救急：关系统代理」。</li>
        </ol>
      </Section>

      <Section title="常见问题">
        <p>
          <strong className="text-fx-text">服务器地址在哪填？</strong>
          <br />
          程序已固定为 {FIXED_LINE_SERVER}，首页只填端口、账号、密码。
        </p>
        <p>
          <strong className="text-fx-text">浏览器模式下列命令行 / Git 不通？</strong>
          <br />
          到「系统服务」启动服务后，再打开「全局模式」。
        </p>
        <p>
          <strong className="text-fx-text">直连规则能改吗？</strong>
          <br />
          不能。仅「自定义规则」可编辑。
        </p>
        <p>
          <strong className="text-fx-text">本地端口是多少？</strong>
          <br />
          混合端口固定为 {DEFAULT_MIXED_PORT}（系统代理与内核监听）。
        </p>
      </Section>

      <Section title="求助时请带上">
        <ol className="list-decimal pl-5 space-y-1">
          <li>开通通知截图（可打码密码中间几位）</li>
          <li>Path One 首页截图</li>
          <li>检测页截图</li>
          <li>当前是浏览器模式还是全局模式</li>
          <li>若相关：系统服务页、内核日志截图</li>
        </ol>
      </Section>
    </div>
  )
}
