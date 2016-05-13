import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { preload }                     from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'
import React_time_ago                  from 'react-time-ago'
import classNames                      from 'classnames'

import { bindActionCreators as bind_action_creators } from 'redux'

import { FormattedDate } from 'react-intl'

import international from '../../international/internationalize'

import { get_user, revoke_authentication_token, save_settings }  from '../../actions/user settings'
import { get_user_authentication_tokens }  from '../../actions/authentication'

import { messages as authentication_form_messages } from '../../components/authentication form'
import default_messages from '../../components/messages'

import Text_input from '../../components/text input'
import Button from '../../components/button'

const messages = defineMessages
({
	header:
	{
		id             : 'user.settings.header',
		description    : 'User account settings page header',
		defaultMessage : 'Settings'
	},
	authentication_tokens:
	{
		id             : 'user.settings.authentication_tokens',
		description    : 'User account authentication tokens',
		defaultMessage : 'Authentication tokens'
	},
	revoke_authentication_token:
	{
		id             : 'user.settings.revoke_authentication_token',
		description    : 'User account authentication token revocation action',
		defaultMessage : 'Revoke'
	},
	revoke_authentication_token_failed:
	{
		id             : 'user.settings.revoke_authentication_token_failed',
		description    : 'User account authentication token revocation action failed',
		defaultMessage : `Couldn't revoke authentication token`
	},
	authentication_token_valid:
	{
		id             : 'user.settings.authentication_token_valid',
		description    : 'User account authentication token valid status',
		defaultMessage : 'Valid'
	},
	authentication_token_revoked:
	{
		id             : 'user.settings.authentication_token_revoked',
		description    : 'User account authentication token revoked status',
		defaultMessage : 'Revoked'
	},
	authentication_token_id:
	{
		id             : 'user.settings.authentication_token_id',
		description    : 'User account authentication tokens table id column header',
		defaultMessage : 'Token'
	},
	authentication_token_issued:
	{
		id             : 'user.settings.authentication_token_issued',
		description    : 'User account authentication tokens table issue date column header',
		defaultMessage : 'Issued'
	},
	authentication_token_status:
	{
		id             : 'user.settings.authentication_token_status',
		description    : 'User account authentication tokens table status column header',
		defaultMessage : 'Status'
	},
	authentication_token_latest_activity:
	{
		id             : 'user.settings.authentication_token_latest_activity',
		description    : 'User account authentication tokens table latest activity column header',
		defaultMessage : 'Activity'
	}
})

@preload((dispatch, get_state, location, parameters) =>
{
	return Promise.all
	([
		dispatch(get_user(get_state().authentication.user.id)),
		dispatch(get_user_authentication_tokens())
	])
})
@connect
(
	model =>
	({
		user                  : model.user_settings.user,
		authentication_tokens : model.authentication.tokens,

		revoking_authentication_token : model.user_settings.revoking_authentication_token,
		saving_settings               : model.user_settings.saving_settings
	}),
	dispatch => bind_action_creators
	({
		revoke_authentication_token,
		save_settings,
		dispatch
	},
	dispatch)
)
@international()
export default class Settings_page extends Component
{
	static propTypes =
	{
		user                  : PropTypes.object.isRequired,
		authentication_tokens : PropTypes.array.isRequired,

		revoke_authentication_token   : PropTypes.func.isRequired,
		revoking_authentication_token : PropTypes.bool,
		save_settings                 : PropTypes.func.isRequired,
		saving_settings               : PropTypes.bool
	}

	state = {}

	constructor(props, context)
	{
		super(props, context)

		this.state.email = props.user.email

		this.revoke_authentication_token = this.revoke_authentication_token.bind(this)
		this.save_settings               = this.save_settings.bind(this)
	}

	render()
	{
		const
		{
			user,
			authentication_tokens,
			translate,
			save_settings,
			saving_settings,
			revoking_authentication_token
		}
		= this.props

		const markup = 
		(
			<div className="content  user-settings">
				{title(translate(messages.header))}

				{/* "Settings" */}
				<h1 style={style.header}>
					{translate(messages.header)}
				</h1>

				{/* User's personal info */}
				<section
					className={classNames
					(
						'content-section'
					)}>

					{/* "Email" */}
					<label htmlFor="email">{translate(authentication_form_messages.email)}</label>

					{/* User's email */}
					<Text_input
						value={this.state.email}
						name="email"
						validate={this.validate_email_on_sign_in}
						on_change={email => this.setState({ email })}
						placeholder={translate(authentication_form_messages.email)}/>

					{/* Form actions */}
					<div className="form__actions">
						{/* "Save changes" */}
						<Button
							busy={saving_settings}
							action={this.save_settings}>
							{translate(default_messages.save)}
						</Button>
					</div>
				</section>

				{/* Authentication tokens */}
				<section
					className={classNames
					(
						'content-section'
					)}>

					{/* "Authentication tokens" */}
					<h2 style={style.header}>{translate(messages.authentication_tokens)}</h2>

					{/* Authentication tokens table */}
					<table>
						<thead>
							<tr>
								<th>{translate(messages.authentication_token_id)}</th>
								<th>{translate(messages.authentication_token_issued)}</th>
								<th>{translate(messages.authentication_token_status)}</th>
								<th>{translate(messages.authentication_token_latest_activity)}</th>
							</tr>
						</thead>

						<tbody>
							{authentication_tokens.map((token, token_index) =>
							{
								const markup =
								(
									<tr key={token_index}>
										{/* Token id */}
										<td>{token.id}</td>

										{/* Token issued on */}
										<td>
											<React_time_ago date={token.created}/>
										</td>

										{/* Token status (valid, revoked) */}
										<td>
											{/* If the token was revoked, show revocation date */}
											{token.revoked &&
												<span>
													{/* "Revoked" */}
													{translate(messages.authentication_token_revoked)}
													{/* when */}
													<React_time_ago date={token.revoked}/>
												</span>
											}

											{/* If the token wasn't revoked then it's valid */}
											{!token.revoked &&
												<span>
													{/* "Valid" */}
													{translate(messages.authentication_token_valid)}

													{/* "Revoke" */}
													<Button
														busy={revoking_authentication_token}
														action={() => this.revoke_authentication_token(token.id)}>
														{translate(messages.revoke_authentication_token)}
													</Button>
												</span>
											}
										</td>

										{/* Latest activity */}
										<td>
											{/* For each different IP address show latest activity time */}
											<ul>
												{token.history.map((activity, activity_index) =>
												{
													{/* Latest activity time for this IP address */}
													return <li key={activity_index}>
														{/* IP address, also resolving city and country */}
														{activity.ip} (city, country),
														{/* Latest activity time */}
														<React_time_ago date={activity.time}/>
													</li>
												})}
											</ul>
										</td>
									</tr>
								)

								return markup
							})}
						</tbody>
					</table>
				</section>
			</div>
		)

		return markup
	}

	async revoke_authentication_token(id)
	{
		try
		{
			alert(id)
			await this.props.revoke_authentication_token(id)
		}
		catch (error)
		{
			alert(this.props.translate(messages.revoke_authentication_token_failed))
		}
	}

	async save_settings()
	{
		try
		{
			const settings = {}
			alert(settings)
			await this.props.save_settings(settings)
		}
		catch (error)
		{
			alert(this.props.translate(messages.revoke_authentication_token_failed))
		}
	}
}

const style = styler
`
	header
		text-align: center
`